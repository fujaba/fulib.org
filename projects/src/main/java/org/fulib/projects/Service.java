package org.fulib.projects;

import org.fulib.projects.editor.EditorCommandHandler;
import org.fulib.projects.editor.EditorService;
import org.fulib.projects.fsevents.FileWatcherCommandHandler;
import org.fulib.projects.fsevents.FileWatcherProcess;
import org.fulib.projects.fsevents.FileWatcherRegistry;
import org.fulib.projects.terminal.TerminalCommandHandler;
import org.fulib.projects.terminal.TerminalController;
import org.fulib.projects.terminal.TerminalService;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class Service
{
	private ScheduledExecutorService scheduler;

	private spark.Service service;

	private volatile ScheduledFuture<?> scheduledStop;
	private TerminalService terminalService;

	public static void main(String[] args)
	{
		new Service().run();
	}

	private void run()
	{
		WebSocketHandler webSocketHandler = new WebSocketHandler();

		// editors
		final EditorService editorService = new EditorService();
		final EditorCommandHandler editorCommandHandler = new EditorCommandHandler(editorService);
		webSocketHandler.getCommandHandlers().add(editorCommandHandler);

		// terminals
		terminalService = new TerminalService();
		final TerminalController terminalController = new TerminalController(terminalService);
		final TerminalCommandHandler terminalCommandHandler = new TerminalCommandHandler(terminalService);
		webSocketHandler.getCommandHandlers().add(terminalCommandHandler);

		// file events
		final FileWatcherProcess fileWatcher = new FileWatcherProcess(webSocketHandler);
		fileWatcher.setDaemon(true);
		fileWatcher.start();

		final FileWatcherRegistry registry = new FileWatcherRegistry(fileWatcher);
		final FileWatcherCommandHandler fileWatcherCommandHandler = new FileWatcherCommandHandler(registry);
		webSocketHandler.getCommandHandlers().add(fileWatcherCommandHandler);

		// scheduled stop
		scheduler = Executors.newSingleThreadScheduledExecutor();
		scheduledStop = scheduler.schedule(this::stop, 120, TimeUnit.SECONDS);
		webSocketHandler.getCommandHandlers().add((command, message, json, session) -> {
			if ("keepAlive".equals(command))
			{
				scheduledStop.cancel(false);
				scheduledStop = scheduler.schedule(this::stop, 60, TimeUnit.SECONDS);
				return true;
			}
			return false;
		});

		final ZipHandler zipHandler = new ZipHandler();

		service = spark.Service.ignite();
		service.port(4567);
		service.webSocket("/ws", webSocketHandler);
		service.get("/health", (req, res) -> "OK");
		service.get("/processes", terminalController::getAll);
		service.get("/zip/*", zipHandler::pack);
		service.post("/zip/*", zipHandler::unpack);
		service.awaitStop();
	}

	private void stop()
	{
		service.stop();
		scheduler.shutdown();
		terminalService.stop();
	}
}
