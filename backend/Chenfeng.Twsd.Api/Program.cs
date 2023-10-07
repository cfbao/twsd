using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.Core;
using Amazon.Lambda.RuntimeSupport;

await LambdaBootstrapBuilder
	.Create<APIGatewayHttpApiV2ProxyRequest, APIGatewayHttpApiV2ProxyResponse>(
		Handler,
		new LambdaSerializer())
	.Build()
	.RunAsync();

static Task<APIGatewayHttpApiV2ProxyResponse> Handler(APIGatewayHttpApiV2ProxyRequest request)
{
	string name = request?.RawPath.TrimStart('/') switch
	{
		{ Length: > 0 } path => path,
		_ => "World",
	};

	return Task.FromResult(new APIGatewayHttpApiV2ProxyResponse
	{
		StatusCode = 200,
		Body = $"Hello, {name}!",
	});
}

[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
internal partial class JsonContext : JsonSerializerContext { }

internal class LambdaSerializer : ILambdaSerializer
{
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
