package org.fulib.webapp.projects.docker;

import com.github.dockerjava.api.async.ResultCallback;
import com.github.dockerjava.api.model.Frame;

import java.io.IOException;
import java.io.OutputStream;

public class OutputStreamResultCallbackAdapter extends ResultCallback.Adapter<Frame>
{
	private final OutputStream output;

	public OutputStreamResultCallbackAdapter(OutputStream output)
	{
		this.output = output;
	}

	@Override
	public void onNext(Frame object)
	{
		try
		{
			output.write(object.getPayload());
		}
		catch (IOException e)
		{
			// TODO
			e.printStackTrace();
		}
	}
}
