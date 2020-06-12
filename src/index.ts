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
  try {
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
        try {
          const dynamoResponse = await dynamoObject
            .putItem(dynamoParams)
            .promise();
          console.log(dynamoResponse);
        } catch (err) {
          console.log(err);
        }

        const sqsDeleteParams = {
          QueueUrl:
            'https://sqs.us-east-1.amazonaws.com/880392359248/BSS-DevOps-SES-Notifications',
          ReceiptHandle: message.ReceiptHandle,
        };
        try {
          const sqsDeleteResponse = await sqsObject
            .deleteMessage(sqsDeleteParams)
            .promise();
          console.log(sqsDeleteResponse);
        } catch (err) {
          console.log(err);
        }
      }
    } else {
      console.log('No messages found');
    }
  } catch (err) {
    console.log(err);
  }
}

main(SQS, DynamoDB);
