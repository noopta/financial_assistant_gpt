import time
from openai import OpenAI
import os
import boto3
from flask import Flask, request, jsonify
from flask_cors import CORS
from botocore.exceptions import NoCredentialsError, ClientError

app = Flask(__name__)
CORS(app)

OpenAI.api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI()

thread = client.beta.threads.create()

def readFromS3():
    # Create an S3 client
    s3 = boto3.client('s3')
    # Your S3 bucket name
    bucket_name = 'financial-assistant-gpt-bucket'

    # Retrieve the list of existing objects in the bucket
    response = s3.list_objects_v2(Bucket=bucket_name)

    # List all objects
    if 'Contents' in response:
        for obj in response['Contents']:
            print(f"Object Key: {obj['Key']}")
            # The local path to which the file should be downloaded
            local_file_name = '/home/ubuntu/financial_assistant_gpt/server/data/' + obj['Key']

            # Downloading the file
            s3.download_file(bucket_name, obj['Key'], local_file_name)
    else:
        print(f"No objects found in bucket {bucket_name}")
    # The name of your bucket
   
    # The key of your object within the bucket
    # replace with response from front end

def uploadFilesToAssistant():
        # Upload the file
        # at this point we can assume we have the files downlaoded locally
    # Path to the directory you want to scan
    folder_path = '/home/ubuntu/financial_assistant_gpt/server/data/'

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
        "asst_EwyAYD7GsbNhWzO3UeUG78kA",
        tools=[{"type": "code_interpreter"}, {"type": "retrieval"}],
        file_ids=file_ids,
    )

def askAssistant(query):

    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=query
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id="asst_EwyAYD7GsbNhWzO3UeUG78kA",
        instructions="The user has a premium account."
    )
    
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id
    )

    time.sleep(40)

    messages = client.beta.threads.messages.list(
        thread_id=thread.id
    )

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
    return True

def add_user_to_database(userInfo):
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
                'country': userInfo['country'],
                'city': userInfo['city'],
                'account_type': 'standard_user',
                'bucket_name': (userInfo['firstName'] + userInfo['lastName'] + '-bucket').lower(),
                'assistant_name': userInfo['email'] + "Financial Assistant"
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
        s3 = boto3.client('s3')
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
        return assistant

def createS3Folder():
    print("yo")

@app.route('/')
def parseFrontEndResponse():
    return "yo"

@app.route('/upload-files')
def uploadFiles():
    createS3Folder()
    readFromS3()
    uploadFilesToAssistant()

    return jsonify({"result": "success"})

@app.route('/post-endpoint', methods=['POST'])
def handle_post():
    data = request.json
    print("Received data:", data)

    response = askAssistant(data['text'])
    print(response)

    return jsonify({"answer": response})


@app.route('/sign-up', methods=['POST'])
def handle_sign_up():
    print("yo")

    data = request.json
    print("Received data:", data)
    add_user_to_database(data['text'])
    bucketName = (data['text']['firstName'] + data['text']['lastName'] + '-bucket').lower()
    
    create_bucket(bucketName, region='us-east-2')
    create_s3_folders(bucketName)
    create_assistant(data['text'])
    
    return jsonify({
        "result": "success"
    })

if __name__ == '__main__':
    app.run(debug=True)
