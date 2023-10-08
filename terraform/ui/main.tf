resource "aws_s3_bucket" "main" {
  bucket = var.service_name
}

resource "aws_cloudfront_origin_access_identity" "main" {}

resource "aws_s3_bucket_policy" "main" {
  bucket = aws_s3_bucket.main.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

data "aws_iam_policy_document" "bucket_policy" {
  statement {
    actions = [
      "s3:GetObject",
    ]
    resources = [
      "${aws_s3_bucket.main.arn}/*",
    ]

    principals {
      type = "AWS"
      identifiers = [
        aws_cloudfront_origin_access_identity.main.iam_arn,
      ]
    }
  }
}
