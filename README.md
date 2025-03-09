npm version : 11.1.0
gulp version : 3.0.0

sam build
sam local start-api

[Deploying dynamoDB into local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.DownloadingAndRunning.html)

#### start dynamodb local version
> java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb

[installing aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
```
PS C:\Users> aws configure
AWS Access Key ID [None]: fakeMyKeyId
AWS Secret Access Key [None]: fakeSecretAccessKey
Default region name [None]: fakeRegion
Default output format [None]: json
```

#### Create dynamodb table locally 
```
aws dynamodb create-table
    --table-name scores
    --attribute-definitions
        AttributeName=game_id,AttributeType=N
        AttributeName=player_id,AttributeType=S
        AttributeName=date,AttributeType=S
    --key-schema
        AttributeName=game_id,KeyType=HASH \
        AttributeName=player_id,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --table-class STANDARD
    --endpoint-url http://localhost:8000
```