resource "aws_s3_bucket" "main" {
  bucket = var.service_name
}

resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

data "aws_iam_policy_document" "bucket_policy" {
  statement {
    principals {
      type = "Service"
      identifiers = [
        "cloudfront.amazonaws.com",
      ]
    }
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.main.arn}/*",
    ]
    condition {
      variable = "AWS:SourceArn"
      test     = "StringEquals"
      values   = [var.cloudfront_distribution_arn]
    }
  }
}
