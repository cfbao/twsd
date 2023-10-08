terraform {
  required_version = "~> 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.19"
    }
  }

  backend "s3" {
    region = "us-east-2"
    bucket = "cfbao-terraform-state"
    key    = "github/cfbao/twsd/terraform.tfstate"
  }
}

provider "aws" {
  region = "us-east-2"

  default_tags {
    tags = {
      Terraform = "https://github.com/cfbao/twsd"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  alias  = "us-east-1"

  default_tags {
    tags = {
      Terraform = "https://github.com/cfbao/twsd"
    }
  }
}

locals {
  service_name = "twsd"
  domain_name  = "twsd.cfbao.me"
}

data "aws_route53_zone" "dns_zone" {
  name = "cfbao.me"
}

module "backend" {
  source = "./backend"

  service_name = local.service_name
}

module "ui" {
  source = "./ui"

  service_name                = local.service_name
  cloudfront_distribution_arn = module.cdn.cloudfront_distribution_arn
}

module "cdn" {
  source = "./cdn"

  providers = {
    aws = aws.us-east-1
  }

  service_name          = local.service_name
  domain_name           = local.domain_name
  dns_zone              = data.aws_route53_zone.dns_zone
  api_gateway_url       = module.backend.api_gateway_url
  ui_bucket_domain_name = module.ui.bucket_domain_name
}
