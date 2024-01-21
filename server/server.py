import shutil
import time
from openai import OpenAI
import os
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from botocore.exceptions import NoCredentialsError, ClientError

app = Flask(__name__)
CORS(app)

s3 = boto3.client('s3')

OpenAI.api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI()

thread = client.beta.threads.create()

def readFromS3(bucket_name, input_assistant_id, fileList):
    # Create an S3 client
    # s3 = boto3.client('s3')
    # Your S3 bucket name

    # Retrieve the list of existing objects in the bucket
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix="chat/")
    print(response)
    newFolderPath = '/home/ubuntu/financial_assistant_gpt/server/chat' + input_assistant_id + '/'

    os.makedirs(newFolderPath, exist_ok=True)

    # List all objects
    if 'Contents' in response:
        for obj in response['Contents']:
            print(f"Object Key: {obj}")
            if (obj['Key'] == "chat/"):
                continue

            # get the string from the 6th character and onwards and store it to a variable
            # this will be the assistant id
            # then we can use that to upload the files to the assistant
            # print(obj['Key'][6:])

            # print(f"Object Key: {obj['Key']}")
            # The local path to which the file should be downloaded
            local_file_name = newFolderPath + obj['Key'][5:]

            fileList.append(obj['Key'][5:])

            fileList[len(fileList) - 1] = fileList[len(fileList) - 1][:len(fileList[len(fileList) - 1]) - 4]

            # Downloading the file
            s3.download_file(bucket_name, obj['Key'], local_file_name)
    else:
        print(f"No objects found in bucket {bucket_name}")
    # The name of your bucket
   
    # The key of your object within the bucket
    # replace with response from front end

def uploadFilesToAssistant(input_assistant_id):
        # Upload the file
        # at this point we can assume we have the files downlaoded locally
    # Path to the directory you want to scan
    print("assisnt ID")
    print(input_assistant_id)
    newFolderPath = '/home/ubuntu/financial_assistant_gpt/server/chat' + input_assistant_id + '/'

    # os.makedirs(newFolderPath, exist_ok=True)

    # folder_path = '/home/ubuntu/financial_assistant_gpt/server/chat/'

    # List all files and directories in the folder
    all_entries = os.listdir(newFolderPath)

    # Filter out directories, keep only files
    file_names = [f for f in all_entries if os.path.isfile(os.path.join(newFolderPath, f))]

    print(file_names)

    fileList = []

    for file in file_names:
        file = client.files.create(
            file=open(
                newFolderPath + file,
                "rb",
            ),
            purpose="assistants",
        )

        fileList.append(file)


    shutil.rmtree(newFolderPath)
    # os.removedirs(newFolderPath)
    
    file_ids = [file.id for file in fileList]

    # imporant FILE ID's for data training related to financial health of a company
    # file-l86Ggl27G60NPA0iqK3WCh7d
    # file-CXpg4stcAOCjuHrPX7rVCDlD
    # file-EOWJi4zXCLxdri8zZaoYZN5l
    # file-nB62OS4uFjumxwZW8JwPBMm1
    # file-BWDKzTXIwATXmr3iftpgshFI
     

    assistant = client.beta.assistants.update(
        input_assistant_id,
        tools=[{"type": "code_interpreter"}, {"type": "retrieval"}],
        file_ids=file_ids,
    )



def askAssistant(query, input_assistant_id, fileList):

    print(query)
    print("*****")
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content= "Use the following files uploaded to you for your answer to the query and get your information from them primarily "  + fileList + " Use the myfiles_browser tool for the following query (if not possible then use code_intepreter and only send one resposne back. Wait until code_interpeter is done until you respond. Do not say anything like Let's start with the first file and then use another message to analyse the files): "+ query 
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=input_assistant_id,
        instructions="The user has a premium account."
    )
    
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id
    )

    initialMessages = client.beta.threads.messages.list(
        thread_id=thread.id
    )

    print(initialMessages)
    newMessages = None

    assistantFlag = False

    while(True):
        newMessages = client.beta.threads.messages.list(
            thread_id=thread.id
        )

        print("*****")
        print(newMessages.data[0].role )

        if newMessages.data[0].role == "assistant" and len(newMessages.data[0].content[0].text.value) > 0:
            break

    # time.sleep(15)


    # messages = client.beta.threads.messages.list(
    #     thread_id=thread.id
    # )
    print()
    print("-------------------")
    newMessages = client.beta.threads.messages.list(
        thread_id=thread.id
    )
    # Iterate through the messages to find the assistant's response
    assistant_response = None
    totalMessages = []
    for message in newMessages:
        if message.role == "assistant":
            assistant_response = message.content
            # totalMessages.append(message.content)
            break

    # Assuming you have the assistant_response as previously retrieved
    if assistant_response:
        # Check if the response is a list and not empty
        if isinstance(assistant_response, list) and assistant_response:
            # Access the text attribute of the first response
            message_content = assistant_response[0].text
            # Now access the value attribute of the text object
            response_text = message_content.value
            return response_text
        else:
            return "Response is not in the expected list format."
    else:
        return "No response from the assistant found."

def create_cors_configuration(bucket_name):
    # s3 = boto3.client('s3')

    cors_configuration = {
        'CORSRules': [{
            'AllowedHeaders': ['*'],
            'AllowedMethods': ['GET', 'POST', 'PUT', 'DELETE'],
            'AllowedOrigins': ['http://localhost:3000'],
            'ExposeHeaders': ['GET', 'POST', 'PUT', 'DELETE'],
            'MaxAgeSeconds': 3000
        }]
    }

    s3.put_bucket_cors(Bucket=bucket_name, CORSConfiguration=cors_configuration)
    print(f"CORS configuration set for bucket {bucket_name}")

def create_bucket(bucket_name, region=None):
    # convert bucket_name to lower case
    bucket_name = bucket_name.lower()
    try:
        if region is None:
            s3_client = boto3.client('s3')
            s3_client.create_bucket(Bucket=bucket_name)
        else:
            s3_client = boto3.client('s3', region_name=region)
            location = {'LocationConstraint': region}
            s3_client.create_bucket(Bucket=bucket_name, CreateBucketConfiguration=location)
    except NoCredentialsError:
        print("Credentials not available")
        return False
    except ClientError as e:
        print(f"An error occurred: {e}")
        return False
    
    create_cors_configuration(bucket_name)
    return True

def add_user_to_database(userInfo):
    print("PRINTING USERINFO")
    
    assistant_id = create_assistant(userInfo)

    print(userInfo)
    try:
        dynamodb = boto3.resource('dynamodb', region_name='us-east-2')
        table = dynamodb.Table('financial_assistant_gpt_db')
        response = table.put_item(
            Item={
                'email': userInfo['email'],
                'firstName': userInfo['firstName'],
                'lastName': userInfo['lastName'],
                'company': userInfo['company'],
                'password': userInfo['password'],
                # 'country': userInfo['country'],
                # 'city': userInfo['city'],
                'account_type': 'standard_user',
                'bucket_name': (userInfo['firstName'] + userInfo['lastName'] + '-bucket').lower(),
                'assistant_name': userInfo['email'] + "Financial Assistant",
                'assistant_id': assistant_id
            }
        )
    except ClientError as e:
        print("yo")
        print(e.response['Error']['Message'])
        print("yo2")
        return e.response['Error']['Message']
    else:
        return response


def create_s3_folders(bucketName):
    try:
        # s3 = boto3.client('s3')
        bucket_name = bucketName
        s3.put_object(Bucket=bucket_name, Key='chat/')
        s3.put_object(Bucket=bucket_name, Key='newsletter/')
    except ClientError as e:
        print(e.response['Error']['Message'])
        return e.response['Error']['Message']
    else:
        return "success"


def create_assistant(userInfo):
    assistant_instructions = """
    I'm a formal yet approachable expert on company financials.

    'Financial Insight' is an expert on the latest financial data of major companies, specializing in analyzing and summarizing quarterly results. Your role is to provide users with clear, concise, and accurate financial interpretations, focusing on factual, data-driven insights.

    Steer clear of speculative financial advice, future market predictions, and personal investment recommendations. Engage with users by clarifying vague questions and adjust the technicality of your responses based on the user's expertise.

    Your interaction style should be primarily professional and formal, mirroring the serious nature of financial analysis. However, occasional light humor or a slightly casual tone can be used to make complex financial concepts more approachable. Address users in a respectful manner, balancing professionalism with approachability.

    Maintain a balance between providing factual insights and being approachable, ensuring that your responses are both informative and engaging.

    You will be provided specific data to reference for your feedback regarding financial statements and documents. These file are attached as a PDF, and are prefixed with "TRAINING_" as their title. They are the first four files. Use them in conjunction with your existing logic to provide answers and insights.

    When users ask for analysis, summary, etc., the user should have uploaded a financial document related to the company they are asking for. You can access these .txt files or .csv files and use your TRAINING data as well as general knowledge to answer.
    """

    try:
        assistant = client.beta.assistants.create(
            name= userInfo['email'] + "Financial Assistant",
            model="gpt-4-1106-preview",
            instructions=assistant_instructions,
            tools=[{"type": "code_interpreter"}, {"type": "retrieval"}],
            file_ids=["file-pkpJaFSfrfvLHkeI9EFmqsJe", "file-bpQAImfohhU66tqcvYLNt5Ks", "file-WLeFeGtsrWxmiFilUU66daJl", "file-24kJTp5XcgMKLHcNsPiaajWi"],
        )
    except ClientError as e:
        print(e.response['Error']['Message'])
        return e.response['Error']['Message']
    else:
        return assistant.id

def createS3Folder():
    print("yo")

@app.route('/')
def parseFrontEndResponse():
    return "yo"

@app.route('/get-file-list-on-load', methods=['POST'])
def get_files():
    print("yo")


@app.route('/get-s3-files', methods=['POST'])
def getS3Files():
    # def getFileNames(bucketName):
        # return fileList

    print("yo")
    data = request.json
    
    print("received data")
    print(data)
    fileList = []
    bucketName = data["bucket"]
    # print(bucketName)
    # s3 = boto3.client('s3')
    response = s3.list_objects_v2(Bucket=bucketName, Prefix="chat/")       
    # print(response)
        # List all objects
    if 'Contents' in response:
        for obj in response['Contents']:
            # Skip if the key is a directory
            if obj['Key'].endswith('/'):
                continue

            print(f"Object Key: {obj['Key']}")
            # The local path to which the file should be downloaded
            local_file_name = os.path.join('/home/ubuntu/financial_assistant_gpt/server/temp', os.path.basename(obj['Key']))
            fileName = obj['Key'][:len(local_file_name) - 4]
            fileList.append(fileName[5:len(fileName) - 4])
    
    print(fileList)
    
    return jsonify({
        "result": "success",
        "fileList": fileList
    })

@app.route('/upload-files', methods=['POST'])
def uploadFiles():
    # createS3Folder()
    data = request.json
    
    print("received data")
    print(data)
    fileList = []
    readFromS3(data["bucket"], data["assistant_id"], fileList)
    uploadFilesToAssistant(data["assistant_id"])

    print("done")
    return jsonify({
        "result": "success",
        "fileList": fileList
    })

@app.route('/post-endpoint', methods=['POST'])
def handle_post():
    data = request.json
    print("Received dataa:", data)

    response = askAssistant(data['text'], data['assistant_id'], data['fileList'])
    print(response)

    return jsonify({"answer": response})


@app.route('/sign-up', methods=['POST'])
def handle_sign_up():
    print("yo")

    data = request.json
    # print("Received data:", data)
    print("Received dataa:", data['text'])
    add_user_to_database(data['text'])
    bucketName = (data['text']['firstName'] + data['text']['lastName'] + '-bucket').lower()
    
    create_bucket(bucketName, region='us-east-2')
    create_s3_folders(bucketName)
    
    return jsonify({
        "result": "success"
    })

@app.route('/create-newsletter', methods=['POST'])
def create_newsletter():
    # topics will be sent in as a list
    data = request.json
    print("Received dataa:", data)
    readFromS3Newsletter()
    uploadToNewsletterAssistant("asst_GJbo1LDmZZgjyxqSwAJhGb3G")
    response = getNewsletterResponse(data, "asst_GJbo1LDmZZgjyxqSwAJhGb3G")
    print(response)

def readFromS3Newsletter(s3):
    # Create an S3 client
    # Your S3 bucket name
    bucket_name = 'anuptaislam-bucket'
    # Specify the folder name
    folder_name = 'newsletter/'

    # Retrieve the list of objects in the specified folder
    response = s3.list_objects_v2(Bucket=bucket_name, Prefix=folder_name)

    # List all objects
    if 'Contents' in response:
        for obj in response['Contents']:
            # Skip if the key is a directory
            if obj['Key'].endswith('/'):
                continue

            print(f"Object Key: {obj['Key']}")
            # The local path to which the file should be downloaded
            local_file_name = os.path.join('/home/ubuntu/financial_assistant_gpt/server/temp', os.path.basename(obj['Key']))

            # Downloading the file
            s3.download_file(bucket_name, obj['Key'], local_file_name)
    else:
        print(f"No objects found in folder '{folder_name}' in bucket {bucket_name}")
    # The name of your bucket
   
    # The key of your object within the bucket
    # replace with response from front end

def uploadToNewsletterAssistant(assistant_id):
        # Upload the file
        # at this point we can assume we have the files downlaoded locally
    # Path to the directory you want to scan
    folder_path = '/home/ubuntu/financial_assistant_gpt/server/temp/'

    # List all files and directories in the folder
    all_entries = os.listdir(folder_path)

    # Filter out directories, keep only files
    file_names = [f for f in all_entries if os.path.isfile(os.path.join(folder_path, f))]

    print(file_names)

    fileList = []

    for file in file_names:
        file = client.files.create(
            file=open(
                folder_path + file,
                "rb",
            ),
            purpose="assistants",
        )

        fileList.append(file)

    
    file_ids = ["file-pkpJaFSfrfvLHkeI9EFmqsJe", "file-bpQAImfohhU66tqcvYLNt5Ks", "file-WLeFeGtsrWxmiFilUU66daJl", "file-24kJTp5XcgMKLHcNsPiaajWi"] + [file.id for file in fileList]

    # imporant FILE ID's for data training related to financial health of a company
    # file-l86Ggl27G60NPA0iqK3WCh7d
    # file-CXpg4stcAOCjuHrPX7rVCDlD
    # file-EOWJi4zXCLxdri8zZaoYZN5l
    # file-nB62OS4uFjumxwZW8JwPBMm1
    # file-BWDKzTXIwATXmr3iftpgshFI

    assistant = client.beta.assistants.update(
        assistant_id,
        tools=[{"type": "code_interpreter"}, {"type": "retrieval"}],
        file_ids=file_ids,
    )

def getNewsletterResponse(data, assistant_id):
    query = 'Create a financial newsletter for the following topics by providing an analysis and make it less than 2000 characters. Base the analysis off of the text documents uploaded to the assistant related to '
    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=query + data['topics']
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id=assistant_id,
        instructions="The user has a premium account."
    )
    
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id
    )

    time.sleep(20)

    messages = client.beta.threads.messages.list(
        thread_id=thread.id
    )

    print("getting message")
    # Iterate through the messages to find the assistant's response
    assistant_response = None
    for message in messages:
        if message.role == "assistant":
            assistant_response = message.content
            break

    # Assuming you have the assistant_response as previously retrieved
    if assistant_response:
        # Check if the response is a list and not empty
        if isinstance(assistant_response, list) and assistant_response:
            # Access the text attribute of the first response
            message_content = assistant_response[0].text
            # Now access the value attribute of the text object
            response_text = message_content.value
            return response_text
        else:
            return "Response is not in the expected list format."
    else:
        return "No response from the assistant found."

def createNewsletter(data, s3):
    # get files from s3 from newsletter folder 
    # get files from bucket in s3
    
    readFromS3Newsletter(s3)
    uploadToNewsletterAssistant("asst_GJbo1LDmZZgjyxqSwAJhGb3G")
    newData = {
        'query': 'Create a financial newsletter for the following topics by providing an analysis and make it less than 2000 characters. Base the analysis off of the text documents uploaded to the assistant related to ' + data['company'] + ': ',
        'topics': 'cloud, data, ai, machine learning, phones',
        'company': 'Google'
    }
    response = getNewsletterResponse(newData, "asst_GJbo1LDmZZgjyxqSwAJhGb3G")

    print(response)

    # upload them to assistant 
    # ask the assistant to create a newsletter analysing the financials starting with the latest document
    # get the response from the assistant
    # create a pdf file with the response
    # send an email to the users email with the pdf file attached and make it recurring for the specified
    # time frame (weekly, monthly, quarterly, yearly)

    # I can pretty much do everything except for the last part which is sending the email with the pdf file attached

    print("yo")


# UNCOMMENT WHEN READY TO RUN PRODUCTION
if __name__ == '__main__':
    app.run(debug=True)

# data = {
#     "topics": ["AI", "Cloud", "Machine Learning", "Phones"],
#     "email": "anuptaislam33@gmail.com",
#     "firstName": "Anupta",
#     "lastName": "Islam",   
#     "company": "Google"
# }

# s3 = boto3.client('s3')

# createNewsletter(data, s3)
