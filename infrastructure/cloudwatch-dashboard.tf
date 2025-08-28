resource "aws_cloudwatch_dashboard" "ecommerce_dashboard" {
  dashboard_name = "ecommerce-platform-${var.environment}"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", "${aws_lambda_function.order_service.function_name}"],
            [".", ".", ".", "${aws_lambda_function.payment_service.function_name}"],
            [".", ".", ".", "${aws_lambda_function.inventory_service.function_name}"]
          ]
          period = 300
          stat   = "Sum"
          title  = "Lambda Invocations"
          region = var.aws_region
        }
      },
      {
        type   = "metric"
        x      = 12
        y      = 0
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", "${aws_lambda_function.order_service.function_name}"],
            [".", ".", ".", "${aws_lambda_function.payment_service.function_name}"],
            [".", ".", ".", "${aws_lambda_function.inventory_service.function_name}"]
          ]
          period = 300
          stat   = "Sum"
          title  = "Lambda Errors"
          region = var.aws_region
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6
        properties = {
          metrics = [
            ["AWS/Events", "Invocations", "EventBusName", "${aws_cloudwatch_event_bus.ecommerce_bus.name}"],
            [".", "FailedInvocations", ".", "."],
            [".", "DeadLetterInvocations", ".", "."]
          ]
          period = 300
          stat   = "Sum"
          title  = "EventBridge Metrics"
          region = var.aws_region
        }
      }
    ]
  })
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors_alarm" {
  for_each = toset([
    aws_lambda_function.order_service.function_name,
    aws_lambda_function.payment_service.function_name,
    aws_lambda_function.inventory_service.function_name
  ])

  alarm_name          = "${each.key}-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "High error rate detected for ${each.key}"
  alarm_actions       = [aws_sns_topic.alarm_notifications.arn]

  dimensions = {
    FunctionName = each.key
  }
}