using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Amazon.Lambda.APIGatewayEvents;
using Amazon.Lambda.RuntimeSupport;

var outputStream = new MemoryStream();

var utf8 = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false);

await new LambdaBootstrap(Handler).RunAsync();

Task<InvocationResponse> Handler(InvocationRequest invocation)
{
	var request = JsonSerializer.Deserialize(invocation.InputStream, JsonContext.Default.APIGatewayHttpApiV2ProxyRequest);

	string name = request?.RawPath.TrimStart('/') switch
	{
		{ Length: > 0 } path => path,
		_ => "World",
	};

	var response = new APIGatewayHttpApiV2ProxyResponse
	{
		StatusCode = 200,
		Body = $"Hello, {name}!",
	};

	outputStream.SetLength(0);
	JsonSerializer.Serialize(outputStream, response, JsonContext.Default.APIGatewayHttpApiV2ProxyResponse);
	outputStream.Position = 0;
	return Task.FromResult(new InvocationResponse(outputStream, disposeOutputStream: false));
}

[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyRequest))]
[JsonSerializable(typeof(APIGatewayHttpApiV2ProxyResponse))]
[JsonSourceGenerationOptions(PropertyNameCaseInsensitive = true)]
internal partial class JsonContext : JsonSerializerContext { }
