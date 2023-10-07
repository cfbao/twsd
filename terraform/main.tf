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

module "backend" {
  source = "./backend"

  service_name = "twsd"
}
