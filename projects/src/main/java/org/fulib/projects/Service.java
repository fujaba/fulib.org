package org.fulib.projects;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class Service
{
	private ScheduledExecutorService scheduler;

	private spark.Service service;

	private volatile ScheduledFuture<?> scheduledStop;
	private WebSocketHandler webSocketHandler;
	private ProcessService processService;

	public static void main(String[] args)
	{
		new Service().run();
	}

	private void run()
	{
		scheduler = Executors.newSingleThreadScheduledExecutor();
		scheduledStop = scheduler.schedule(this::stop, 120, TimeUnit.SECONDS);

		processService = new ProcessService();

		webSocketHandler = new WebSocketHandler(() -> {
			scheduledStop.cancel(false);
			scheduledStop = scheduler.schedule(this::stop, 60, TimeUnit.SECONDS);
		});
		webSocketHandler.setProcessService(processService);

		final FileWatcherProcess fileWatcher = new FileWatcherProcess(webSocketHandler);
		fileWatcher.setDaemon(true);
		fileWatcher.start();

		final FileWatcherRegistry registry = new FileWatcherRegistry(fileWatcher);
		webSocketHandler.setFileWatcher(registry);

		final ZipHandler zipHandler = new ZipHandler();

		final ProcessController processController = new ProcessController(processService);

		service = spark.Service.ignite();
		service.port(4567);
		service.webSocket("/ws", webSocketHandler);
		service.get("/health", (req, res) -> "OK");
		service.get("/processes", processController::getAll);
		service.get("/zip/*", zipHandler::pack);
		service.post("/zip/*", zipHandler::unpack);
		service.awaitStop();
	}

	private void stop()
	{
		service.stop();
		scheduler.shutdown();
		processService.stop();
	}
}
