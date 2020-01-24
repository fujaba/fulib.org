package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Comment;
import org.fulib.webapp.mongo.Mongo;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;

import java.util.List;

public class Comments
{
	public static Object getChildren(Request request, Response response)
	{
		final String parentID = request.params("parentID");

		JSONObject result = new JSONObject();
		JSONArray array = new JSONArray();

		final List<Comment> comments = Mongo.get().getComments(parentID);
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
		obj.put(Comment.PROPERTY_author, comment.getAuthor());
		obj.put(Comment.PROPERTY_email, comment.getEmail());
		obj.put(Comment.PROPERTY_markdown, comment.getMarkdown());
		obj.put(Comment.PROPERTY_html, comment.getHtml());
		return obj;
	}
}
