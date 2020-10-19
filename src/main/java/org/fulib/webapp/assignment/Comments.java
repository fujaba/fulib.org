package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Comment;
import org.fulib.webapp.assignment.model.Solution;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.MarkdownUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.time.Instant;
import java.util.List;

public class Comments
{
	private final Mongo mongo;

	public Comments(Mongo mongo)
	{
		this.mongo = mongo;
	}

	public Object post(Request request, Response response)
	{
		final Instant timeStamp = Instant.now();

		final String solutionID = request.params("solutionID");
		final Solution solution = Solutions.getSolutionOr404(this.mongo, solutionID);
		final boolean privileged = Solutions.checkPrivilege(request, solution);

		final String commentID = IDGenerator.generateID();
		final Comment comment = fromJson(commentID, new JSONObject(request.body()));

		final String userId = Assignments.getUserId(request);
		if (userId != null)
		{
			comment.setUserId(userId);
		}

		final String html = MarkdownUtil.renderHtml(comment.getMarkdown());

		comment.setParent(solutionID);
		comment.setTimeStamp(timeStamp);
		comment.setHtml(html);
		comment.setDistinguished(privileged);

		this.mongo.saveComment(comment);

		final JSONObject result = new JSONObject();

		result.put(Comment.PROPERTY_id, commentID);
		if (userId != null)
		{
			result.put(Comment.PROPERTY_userId, userId);
		}
		result.put(Comment.PROPERTY_timeStamp, timeStamp.toString());
		result.put(Comment.PROPERTY_html, html);
		result.put(Comment.PROPERTY_distinguished, privileged);

		return result.toString(2);
	}

	private static Comment fromJson(String id, JSONObject obj)
	{
		final Comment comment = new Comment(id);
		// id, timeStamp, html generated server-side
		// parent via path parameter
		comment.setAuthor(obj.getString(Comment.PROPERTY_author));
		comment.setEmail(obj.getString(Comment.PROPERTY_email));
		comment.setMarkdown(obj.getString(Comment.PROPERTY_markdown));
		return comment;
	}

	public Object getChildren(Request request, Response response)
	{
		final String solutionID = request.params("solutionID");
		final Solution solution = Solutions.getSolutionOr404(this.mongo, solutionID);
		Solutions.checkPrivilege(request, solution);

		JSONObject result = new JSONObject();
		JSONArray array = new JSONArray();

		final List<Comment> comments = this.mongo.getComments(solutionID);
		for (final Comment comment : comments)
		{
			array.put(toJson(comment));
		}

		result.put("children", array);

		return result.toString(2);
	}

	private static JSONObject toJson(Comment comment)
	{
		JSONObject obj = new JSONObject();
		obj.put(Comment.PROPERTY_id, comment.getID());
		obj.put(Comment.PROPERTY_parent, comment.getParent());
		obj.put(Comment.PROPERTY_timeStamp, comment.getTimeStamp().toString());
		obj.put(Comment.PROPERTY_userId, comment.getUserId());
		obj.put(Comment.PROPERTY_author, comment.getAuthor());
		obj.put(Comment.PROPERTY_email, comment.getEmail());
		obj.put(Comment.PROPERTY_markdown, comment.getMarkdown());
		obj.put(Comment.PROPERTY_html, comment.getHtml());
		obj.put(Comment.PROPERTY_distinguished, comment.isDistinguished());
		return obj;
	}

	public Object delete(Request request, Response response)
	{
		final String commentID = request.params("commentID");
		final Comment comment = this.mongo.getComment(commentID);
		if (comment == null)
		{
			throw Spark.halt(404, String.format("{\n  \"error\": \"comment with id '%s' not found\"\n}\n", commentID));
		}

		final String userId = Assignments.getUserId(request);
		if (userId == null)
		{
			throw Spark.halt(401, "{\n  \"error\": \"missing bearer token\"\n}\n");
		}
		if (!userId.equals(comment.getUserId()))
		{
			throw Spark.halt(401, "{\n  \"error\": \"userId query parameter does not match ID of comment\"\n}\n");
		}

		comment.setMarkdown(null);
		comment.setHtml(null);

		this.mongo.saveComment(comment);

		return "{}";
	}
}
