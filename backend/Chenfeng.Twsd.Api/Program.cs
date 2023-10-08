using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.DynamoDBv2;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.RuntimeSupport;

var dynamodb = new AmazonDynamoDBClient();

await LambdaBootstrapBuilder
	.Create<APIGatewayHttpApiV2ProxyRequest, APIGatewayHttpApiV2ProxyResponse>(
		Handler,
		new LambdaSerializer())
	.Build()
	.RunAsync();

async Task<APIGatewayHttpApiV2ProxyResponse> Handler(APIGatewayHttpApiV2ProxyRequest request, ILambdaContext context)
{
	if (request.RouteKey == "POST /api/message")
	{
		return new() { StatusCode = 200, Body = "message stored" };
	}
	if (request.RouteKey == "DELETE /api/message/{id}")
	{
		return new() { StatusCode = 200, Body = "message destroyed" };
	}

	throw new NotImplementedException();
}

internal record NewMessageRequest(
	string Id,
	string Ciphertext,
	string Iv
);

internal partial class LambdaSerializer : ILambdaSerializer
{
	[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
	[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
	[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
	private partial class JsonContext : JsonSerializerContext { }

	public T Deserialize<T>(Stream requestStream)
	{
		return (T)(object)JsonSerializer.Deserialize(
			requestStream,
			JsonContext.Default.APIGatewayHttpApiV2ProxyRequest)!;
	}

	public void Serialize<T>(T response, Stream responseStream)
	{
		JsonSerializer.Serialize(
			responseStream,
			(APIGatewayHttpApiV2ProxyResponse)(object)response!,
			JsonContext.Default.APIGatewayHttpApiV2ProxyResponse);
	}
}
