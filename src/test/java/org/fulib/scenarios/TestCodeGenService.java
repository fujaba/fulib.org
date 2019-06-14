package org.fulib.scenarios;

import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assert.assertThat;

public class TestCodeGenService
{
	@Test
	public void testCodeGenService() throws InterruptedException, IOException, JSONException
	{
		 // start server
		ExecutorService threadPool = Executors.newCachedThreadPool();

		threadPool.execute(() -> WebService.main(null));

		Thread.sleep(2000);

		// post request
		URL url = new URL("http://localhost:4567/runcodegen");
		URLConnection con = url.openConnection();
		HttpURLConnection http = (HttpURLConnection)con;
		http.setRequestMethod("POST"); // PUT is another valid option
		http.setDoOutput(true);

		String scenarioText = "" +
				"# Scenario simple. \n" +
				"\n" +
				"There is a Party.\n" +
				"\n" +
				"![Party](party.yaml)\n" +
				"";
		JSONObject jsonObject = new JSONObject();
		jsonObject.put("scenarioText", scenarioText);

		String jsonText = jsonObject.toString(3);
		byte[] out = jsonText.getBytes(StandardCharsets.UTF_8);
		int length = out.length;

		http.setFixedLengthStreamingMode(length);
		http.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
		http.connect();
		try(OutputStream os = http.getOutputStream()) {
			os.write(out);
		}

		// validate result
		InputStream inputStream = http.getInputStream();
		InputStreamReader streamReader = new InputStreamReader(inputStream);
		BufferedReader bufferedReader = new BufferedReader(streamReader);
		String body = bufferedReader.lines().collect(Collectors.joining("\n"));

		System.out.println(body);

		JSONObject jsonResult = new JSONObject(body);
		assertThat(jsonResult.getString("classDiagram"), notNullValue());
		assertThat(jsonResult.getInt("exitCode"), equalTo(0));
		assertThat(jsonResult.getString("output"), notNullValue());
		assertThat(jsonResult.getJSONArray("testMethods"), notNullValue());

	}
}
