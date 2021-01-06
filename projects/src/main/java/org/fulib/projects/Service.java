package org.fulib.projects;

public class Service
{
	public static void main(String[] args)
	{
		final spark.Service service = spark.Service.ignite();
		service.port(4567);
		service.webSocket("/ws", new WebSocketHandler());
		service.init();
	}
}
