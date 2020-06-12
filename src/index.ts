import * as AWS from 'aws-sdk';

const SQS = new AWS.SQS({ region: 'us-east-1' });
const DynamoDB = new AWS.DynamoDB({ region: 'us-east-1' });

async function main(sqsObject: AWS.SQS, dynamoObject: AWS.DynamoDB) {
  const sqsParams = {
    QueueUrl:
      'https://sqs.us-east-1.amazonaws.com/880392359248/BSS-DevOps-SES-Notifications',
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 10,
    WaitTimeSeconds: 15,
  };
  const response = await sqsObject.receiveMessage(sqsParams).promise();
  if (response?.Messages) {
    console.log(response.Messages);
  } else {
    console.log('No messages found');
  }

  const dynamoParams = {};
  const dynamoResponse = await dynamoObject.
}

main(SQS, DynamoDB);
