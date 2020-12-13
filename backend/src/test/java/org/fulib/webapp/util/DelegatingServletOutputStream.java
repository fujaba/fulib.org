package org.fulib.webapp.util;

import javax.servlet.ServletOutputStream;
import javax.servlet.WriteListener;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class DelegatingServletOutputStream extends ServletOutputStream
{
	private final OutputStream outputStream;

	public DelegatingServletOutputStream(OutputStream outputStream)
	{
		this.outputStream = outputStream;
	}

	@Override
	public boolean isReady()
	{
		return true;
	}

	@Override
	public void setWriteListener(WriteListener writeListener)
	{
	}

	@Override
	public void write(int b) throws IOException
	{
		this.outputStream.write(b);
	}

	@Override
	public void write(byte[] b) throws IOException
	{
		this.outputStream.write(b);
	}

	@Override
	public void write(byte[] b, int off, int len) throws IOException
	{
		this.outputStream.write(b, off, len);
	}

	@Override
	public void flush() throws IOException
	{
		this.outputStream.flush();
	}

	@Override
	public void close() throws IOException
	{
		this.outputStream.close();
	}
}
