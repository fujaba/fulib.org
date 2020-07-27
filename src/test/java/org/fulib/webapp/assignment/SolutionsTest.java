package org.fulib.webapp.assignment;

import org.fulib.webapp.mongo.Mongo;
import org.json.JSONObject;
import org.junit.Test;
import spark.HaltException;
import spark.Request;
import spark.Response;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class SolutionsTest
{
	@Test
	public void create404() throws Exception
	{
		final Mongo db = mock(Mongo.class);
		final Solutions solutions = new Solutions(db);
		final Request request = mock(Request.class);
		final Response response = mock(Response.class);

		when(request.params("assignmentID")).thenReturn("-1");
		when(db.getAssignment("-1")).thenReturn(null);

		try
		{
			solutions.create(request, response);
			fail("did not throw HaltException");
		}
		catch (HaltException ex)
		{
			assertThat(ex.statusCode(), equalTo(404));
			final JSONObject body = new JSONObject(ex.body());
			assertThat(body.getString("error"), equalTo("assignment with id '-1'' not found")); // TODO '
		}
	}
}
