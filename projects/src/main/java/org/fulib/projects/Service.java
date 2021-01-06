package org.fulib.projects;

public class Service
{
	public static void main(String[] args)
	{
		final WebSocketHandler webSocketHandler = new WebSocketHandler();
		final FileWatcherProcess fileWatcherProcess = new FileWatcherProcess(webSocketHandler);

		fileWatcherProcess.start();

		final spark.Service service = spark.Service.ignite();
		service.port(4567);
		service.webSocket("/ws", webSocketHandler);
		service.init();
	}
}
