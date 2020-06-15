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
        console.log(message);
        // console.log(message.Body);
        let jsonMessageBody = JSON.parse(message.Body);
        let dynamoParams = {
          Item: {
            messageid: {
              S: message.MessageId,
            },
            messageBody: {
              S: message.Body,
            },
          },
          TableName: 'BSS-DevOps-SES-Notifications',
        };
        console.log(dynamoParams);
        if (jsonMessageBody.notificationType === 'Bounce') {
          let messageBodyNotifyType = jsonMessageBody.notificationType;
          let destinationAddress =
            jsonMessageBody.bounce.bouncedRecipients[0].emailAddress;
          let sourceAddress = jsonMessageBody.mail.source;
          let commonHeaders = jsonMessageBody.mail.commonHeaders;
          console.log(messageBodyNotifyType, destinationAddress, sourceAddress);
          Object.assign(dynamoParams.Item, {
            notificationType: {
              S: messageBodyNotifyType,
            },
          });
          Object.assign(dynamoParams.Item, {
            sourceAddress: {
              S: sourceAddress,
            },
          });
          Object.assign(dynamoParams.Item, {
            commonHeaders: {
              M: commonHeaders,
            },
          });
          Object.assign(dynamoParams.Item, {
            destinationAddress: {
              S: destinationAddress,
            },
          });
          console.log(dynamoParams);
        }
        console.log(dynamoParams);
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

  const sqsDlqParams = {
    QueueUrl:
      'https://sqs.us-east-1.amazonaws.com/880392359248/BSS-DevOps-SES-Notifications-DLQ',
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 10,
    WaitTimeSeconds: 15,
  };
  const sqsDlqReceiveResponse = await sqsObject
    .receiveMessage(sqsParams)
    .promise();
  console.log(sqsDlqReceiveResponse);
  if (sqsDlqReceiveResponse?.Messages) {
    for (let dlqMessage in sqsDlqReceiveResponse.Messages) {
      console.log(dlqMessage);
    }
  } else {
    const dlqPurge = await sqsObject
      .purgeQueue({
        QueueUrl:
          'https://sqs.us-east-1.amazonaws.com/880392359248/BSS-DevOps-SES-Notifications-DLQ',
      })
      .promise();
    console.log(dlqPurge);
  }
}

main(SQS, DynamoDB);
