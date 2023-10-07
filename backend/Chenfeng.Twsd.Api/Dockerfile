FROM public.ecr.aws/amazonlinux/amazonlinux:2 AS build

RUN yum update -y && yum install -y clang openssl-devel wget tar gzip libicu

RUN mkdir -p /usr/share/dotnet && ln -s /usr/share/dotnet/dotnet /usr/bin/dotnet

RUN wget https://dot.net/v1/dotnet-install.sh \
	&& chmod +x ./dotnet-install.sh \
	&& ./dotnet-install.sh --channel 8.0 --install-dir /usr/share/dotnet

WORKDIR /source

# Configs change less frequently than code.
# Make configs & dependencies a separate layer to improve caching & build time on code change.
COPY Chenfeng.Twsd.Api.csproj Chenfeng.Twsd.Api.csproj
RUN dotnet restore -r linux-x64

COPY . .
RUN dotnet publish --no-restore -o /app

FROM scratch as export
COPY --from=build /app/bootstrap /bootstrap
