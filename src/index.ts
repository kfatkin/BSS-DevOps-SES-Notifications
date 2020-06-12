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
  const sqsReceiveResponse = await sqsObject
    .receiveMessage(sqsParams)
    .promise();
  if (sqsReceiveResponse?.Messages) {
    console.log(sqsReceiveResponse.Messages);
    for (let message of sqsReceiveResponse.Messages) {
      const dynamoParams = {
        Item: {
          messageid: {
            S: message.MessageId,
          },
          messageBody: {
            S: message.Body,
          },
        },
        TableName: 'BSS-DevOps-DynamoDB-SES-Notifications',
      };
      const dynamoResponse = await dynamoObject.putItem(dynamoParams).promise();
      console.log(dynamoResponse);
      const sqsDeleteParams = {
        QueueUrl:
          'https://sqs.us-east-1.amazonaws.com/880392359248/BSS-DevOps-SES-Notifications',
        ReceiptHandle: message.ReceiptHandle,
      };
      const sqsDeleteResponse = await sqsObject
        .deleteMessage(sqsDeleteParams)
        .promise();
    }
  } else {
    console.log('No messages found');
  }
}

main(SQS, DynamoDB);
