resource "aws_sqs_queue" "eventbridge_dlq" {
  name = "eventbridge-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Environment = var.environment
    Service     = "ecommerce"
  }
}

resource "aws_lambda_function_event_invoke_config" "with_dlq" {
  for_each = toset(var.lambda_functions)

  function_name          = each.key
  maximum_retry_attempts = 2
  destination_config {
    on_failure {
      destination = aws_sqs_queue.eventbridge_dlq.arn
    }
  }
}

resource "aws_lambda_event_source_mapping" "dlq_processor" {
  event_source_arn = aws_sqs_queue.eventbridge_dlq.arn
  function_name    = aws_lambda_function.dlq_processor.function_name
  batch_size       = 10
}

resource "aws_lambda_function" "dlq_processor" {
  filename      = "dlq-processor.zip"
  function_name = "dlq-processor-${var.environment}"
  role          = aws_iam_role.dlq_processor.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"

  environment {
    variables = {
      LOG_LEVEL = "ERROR"
    }
  }
}