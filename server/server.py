import time
from openai import OpenAI
import os
import boto3

OpenAI.api_key = os.getenv('OPENAI_API_KEY')
client = OpenAI()

thread = client.beta.threads.create()

def readFromS3():
    # Create an S3 client
    s3 = boto3.client('s3')

    # The name of your bucket
    bucket_name = 'financial-assistant-gpt-bucket'

    # The key of your object within the bucket
    # replace with response from front end
    object_name = 'google_earnings_2023_q3.txt'

    # The local path to which the file should be downloaded
    local_file_name = '/home/ubuntu/financial_assistant_gpt/server/' + object_name

    # Downloading the file
    s3.download_file(bucket_name, object_name, local_file_name)

readFromS3()

while(True):
    threadMessage = input("What question about travelling did you have? No questions? Enter Q to exit.\n")
    
    if threadMessage == "Q" or threadMessage == "q":
        break

    message = client.beta.threads.messages.create(
        thread_id=thread.id,
        role="user",
        content=threadMessage
    )

    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id="asst_EwyAYD7GsbNhWzO3UeUG78kA",
        instructions="Please address the user as Jane Doe. The user has a premium account."
    )
    
    run = client.beta.threads.runs.retrieve(
        thread_id=thread.id,
        run_id=run.id
    )

    time.sleep(20)

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
            print("\n\n" + response_text)
        else:
            print("Response is not in the expected list format.")
    else:
        print("No response from the assistant found.")

def getResponseFromGpt():
    print("yo")
