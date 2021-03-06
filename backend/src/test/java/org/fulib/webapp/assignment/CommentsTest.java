package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Assignment;
import org.fulib.webapp.assignment.model.Comment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.MarkdownUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import spark.Request;
import spark.Response;

import java.time.Instant;
import java.util.Collections;
import java.util.concurrent.Callable;

import static org.hamcrest.CoreMatchers.equalTo;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.mockito.Mockito.*;

public class CommentsTest
{
	private static final String SOLUTION_ID = "s1";
	private static final String SOLUTION_TOKEN = "s123";
	private static final String ASSIGNMENT_ID = "a1";
	private static final String ASSIGNMENT_TOKEN = "a123";
	private static final String AUTHOR = "Testus";
	private static final String EMAIL = "test@example.org";
	private static final String BODY = "Hello there";
	private static final String BODY_HTML = "<p>Hello there</p>\n";

	private static final String ID = "c1";
	private static final String TIMESTAMP = "2020-01-01T12:00:00Z";
	private static final boolean DISTINGUISHED = false;

	private Mongo db;
	private Comments comments;
	private Request request;
	private Response response;

	@Before
	public void setup()
	{
		this.db = mock(Mongo.class);
		final MarkdownUtil markdownUtil = new MarkdownUtil();
		this.comments = new Comments(markdownUtil, db);
		this.request = mock(Request.class);
		this.response = mock(Response.class);
	}

	@Test
	public void post404() throws Exception
	{
		when(request.params("solutionID")).thenReturn("-1");
		when(db.getSolution("-1")).thenReturn(null);

		TestHelper.expectHalt(404, "solution with id '-1'' not found", () -> comments.post(request, response));
	}

	@Test
	public void postWithoutToken() throws Exception
	{
		final Solution solution = createExampleSolution();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		checkInvalidToken(() -> comments.post(request, response));
	}

	@Test
	public void postWithWrongSolutionToken() throws Exception
	{
		final Solution solution = createExampleSolution();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Solution-Token")).thenReturn("s456");
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		checkInvalidToken(() -> comments.post(request, response));
	}

	@Test
	public void postWithWrongAssignmentToken() throws Exception
	{
		final Solution solution = createExampleSolution();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Assignment-Token")).thenReturn("a456");
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		checkInvalidToken(() -> comments.post(request, response));
	}

	private void checkInvalidToken(Callable<?> body) throws Exception
	{
		TestHelper.expectHalt(401, "invalid Assignment-Token or Solution-Token", body);
	}

	private Solution createExampleSolution()
	{
		final Assignment assignment = new Assignment(ASSIGNMENT_ID);
		assignment.setToken(ASSIGNMENT_TOKEN);

		final Solution solution = new Solution(SOLUTION_ID);
		solution.setAssignment(assignment);
		solution.setToken(SOLUTION_TOKEN);
		return solution;
	}

	@Test
	public void postWithSolutionToken()
	{
		final Solution solution = createExampleSolution();
		final String requestBody = createPostRequestBody();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Solution-Token")).thenReturn(SOLUTION_TOKEN);
		when(request.body()).thenReturn(requestBody);
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		final String responseBody = (String) comments.post(request, response);

		this.checkPostResponse(responseBody, false);
		this.checkNewDbObject(db, false);
	}

	@Test
	public void postWithAssignmentToken()
	{
		final Solution solution = createExampleSolution();
		final String requestBody = createPostRequestBody();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Assignment-Token")).thenReturn(ASSIGNMENT_TOKEN);
		when(request.body()).thenReturn(requestBody);
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		final String responseBody = (String) comments.post(request, response);

		this.checkPostResponse(responseBody, true);
		this.checkNewDbObject(db, true);
	}

	private String createPostRequestBody()
	{
		final JSONObject requestObj = new JSONObject();
		requestObj.put("author", AUTHOR);
		requestObj.put("email", EMAIL);
		requestObj.put("markdown", BODY);
		return requestObj.toString();
	}

	private void checkNewDbObject(Mongo db, boolean distinguished)
	{
		final ArgumentCaptor<Comment> commentCaptor = ArgumentCaptor.forClass(Comment.class);
		verify(db).saveComment(commentCaptor.capture());

		final Comment comment = commentCaptor.getValue();
		assertThat(comment.getID(), notNullValue());
		assertThat(comment.getTimeStamp(), notNullValue());
		assertThat(comment.getParent(), equalTo(SOLUTION_ID));
		assertThat(comment.getAuthor(), equalTo(AUTHOR));
		assertThat(comment.getEmail(), equalTo(EMAIL));
		assertThat(comment.getMarkdown(), equalTo(BODY));
		assertThat(comment.getHtml(), equalTo(BODY_HTML));
		assertThat(comment.isDistinguished(), equalTo(distinguished));
	}

	private void checkPostResponse(String responseBody, boolean distinguished)
	{
		final JSONObject responseObj = new JSONObject(responseBody);
		assertThat(responseObj.getString("id"), notNullValue());
		assertThat(responseObj.getString("timeStamp"), notNullValue());
		assertThat(responseObj.getString("html"), equalTo(BODY_HTML));
		assertThat(responseObj.getBoolean("distinguished"), equalTo(distinguished));
	}

	@Test
	public void getChildren404() throws Exception
	{
		when(request.params("solutionID")).thenReturn("-1");
		when(db.getSolution("-1")).thenReturn(null);

		TestHelper.expectHalt(404, "solution with id '-1'' not found", () -> comments.getChildren(request, response));
	}

	@Test
	public void getChildrenWithoutToken() throws Exception
	{
		final Solution solution = createExampleSolution();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		checkInvalidToken(() -> comments.getChildren(request, response));
	}

	@Test
	public void getChildrenWithWrongSolutionToken() throws Exception
	{
		final Solution solution = createExampleSolution();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Solution-Token")).thenReturn("s456");
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		checkInvalidToken(() -> comments.getChildren(request, response));
	}

	@Test
	public void getChildrenWithWrongAssignmentToken() throws Exception
	{
		final Solution solution = createExampleSolution();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Assignment-Token")).thenReturn("a456");
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);

		checkInvalidToken(() -> comments.getChildren(request, response));
	}

	@Test
	public void getChildren()
	{
		final Solution solution = createExampleSolution();
		final Comment comment = createExampleComment();

		when(request.params("solutionID")).thenReturn(SOLUTION_ID);
		when(request.headers("Solution-Token")).thenReturn(SOLUTION_TOKEN);
		when(db.getSolution(SOLUTION_ID)).thenReturn(solution);
		when(db.getComments(SOLUTION_ID)).thenReturn(Collections.singletonList(comment));

		final String responseBody = (String) comments.getChildren(request, response);

		final JSONObject responseObj = new JSONObject(responseBody);
		final JSONArray children = responseObj.getJSONArray("children");
		final JSONObject commentObj = children.getJSONObject(0);

		assertThat(commentObj.getString("id"), notNullValue());
		assertThat(commentObj.getString("parent"), equalTo(SOLUTION_ID));
		assertThat(commentObj.getString("timeStamp"), equalTo(TIMESTAMP));
		assertThat(commentObj.getString("author"), equalTo(AUTHOR));
		assertThat(commentObj.getString("email"), equalTo(EMAIL));
		assertThat(commentObj.getString("markdown"), equalTo(BODY));
		assertThat(commentObj.getString("html"), equalTo(BODY_HTML));
		assertThat(commentObj.getBoolean("distinguished"), equalTo(false));
	}

	private Comment createExampleComment()
	{
		final Comment comment = new Comment(ID);
		comment.setParent(SOLUTION_ID);
		comment.setTimeStamp(Instant.parse(TIMESTAMP));
		comment.setAuthor(AUTHOR);
		comment.setEmail(EMAIL);
		comment.setMarkdown(BODY);
		comment.setHtml(BODY_HTML);
		comment.setDistinguished(DISTINGUISHED);
		return comment;
	}
}
