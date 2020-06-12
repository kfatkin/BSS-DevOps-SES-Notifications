# SES to SQS to DynamoDB Script

### Install Node.JS and TypeScript dependencies

`npm install`

### Watch trasnpile for code changes

`tsc -w`

### Docker image build command:

`docker image build -t kfatkin/sesdynamodbsqstypescript .`

### App purpose

This app is made to run out of AWS Batch via a container and check an SQS queue that receives messages/bounces/failures from SES. It will then write the message ID and messgae body to DynamoDB for later review. Feel free to add a TTL field if you would like messages to expire. Once it write the item to DynamoDB it will delete from SQS. This is meant to be a quick and dirty script to run out of the container.
