FROM localstack/localstack:3.0

ENV SERVICES=iam,s3,sts,secretsmanager,cloudtrail,lambda,kms,dynamodb \
    AWS_DEFAULT_REGION=us-east-1 \
    PERSISTENCE=1

EXPOSE 4566
