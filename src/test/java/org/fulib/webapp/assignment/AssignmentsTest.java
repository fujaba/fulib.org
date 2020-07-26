package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Task;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONObject;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import spark.Request;
import spark.Response;

import java.time.Instant;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

public class AssignmentsTest
{
	@Test
	public void create()
	{
		final Mongo db = mock(Mongo.class);
		final Assignments assignments = new Assignments(db);

		final Request request = mock(Request.class);
		// language=JSON
		final String requestBody =
			"{\n" + "  \"title\": \"Test Example\",\n" + "  \"description\": \"An assignment for the test.\",\n"
			+ "  \"author\": \"Testus\",\n" + "  \"email\": \"test@example.org\",\n"
			+ "  \"deadline\": \"2030-01-01T12:00:00Z\",\n"
			+ "  \"solution\": \"There is a student with name Alice.\",\n"
			+ "  \"templateSolution\": \"There is a ...\",\n" + "  \"tasks\": [\n" + "    {\n"
			+ "      \"description\": \"Create a student object.\",\n" + "      \"points\": 5,\n"
			+ "      \"verification\": \"We match some Student s1.\"\n" + "    },\n" + "    {\n"
			+ "      \"description\": \"Give the student the name Alice.\",\n" + "      \"points\": 10,\n"
			+ "      \"verification\": \"We match some Student s1 with name Alice.\"\n" + "    }\n" + "  ]\n" + "}";
		when(request.body()).thenReturn(requestBody);

		final Response response = mock(Response.class);

		final String responseBody = (String) assignments.create(request, response);
		final ArgumentCaptor<Assignment> assignmentCaptor = ArgumentCaptor.forClass(Assignment.class);

		verify(db).saveAssignment(assignmentCaptor.capture());

		final JSONObject responseObj = new JSONObject(responseBody);
		assertThat(responseObj.getString("id"), notNullValue());
		assertThat(responseObj.getString("token"), notNullValue());
		assertThat(responseObj.getString("descriptionHtml"), equalTo("<p>An assignment for the test.</p>\n"));

		final Assignment assignment = assignmentCaptor.getValue();
		assertThat(assignment.getID(), notNullValue());
		assertThat(assignment.getToken(), notNullValue());
		assertThat(assignment.getTitle(), equalTo("Test Example"));
		assertThat(assignment.getDescription(), equalTo("An assignment for the test."));
		assertThat(assignment.getDescriptionHtml(), equalTo("<p>An assignment for the test.</p>\n"));
		assertThat(assignment.getAuthor(), equalTo("Testus"));
		assertThat(assignment.getEmail(), equalTo("test@example.org"));
		assertThat(assignment.getDeadline(), equalTo(Instant.parse("2030-01-01T12:00:00Z")));
		assertThat(assignment.getSolution(), equalTo("There is a student with name Alice."));
		assertThat(assignment.getTemplateSolution(), equalTo("There is a ..."));

		final Task task0 = assignment.getTasks().get(0);
		assertThat(task0.getDescription(), equalTo("Create a student object."));
		assertThat(task0.getPoints(), equalTo(5));
		assertThat(task0.getVerification(), equalTo("We match some Student s1."));

		final Task task1 = assignment.getTasks().get(1);
		assertThat(task1.getDescription(), equalTo("Give the student the name Alice."));
		assertThat(task1.getPoints(), equalTo(10));
		assertThat(task1.getVerification(), equalTo("We match some Student s1 with name Alice."));
	}
}
