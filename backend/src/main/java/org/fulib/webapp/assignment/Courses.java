package org.fulib.webapp.assignment;

import org.fulib.webapp.assignment.model.Course;
import org.fulib.webapp.mongo.Mongo;
import org.fulib.webapp.tool.Authenticator;
import org.fulib.webapp.tool.IDGenerator;
import org.fulib.webapp.tool.MarkdownUtil;
import org.json.JSONArray;
import org.json.JSONObject;
import spark.Request;
import spark.Response;
import spark.Spark;

import java.util.ArrayList;
import java.util.List;

public class Courses
{
	// language=JSON
	static final String UNKNOWN_COURSE_RESPONSE = "{\n  \"error\": \"course with id '%s'' not found\"\n}";

	private final MarkdownUtil markdownUtil;
	private final Mongo mongo;

	public Courses(MarkdownUtil markdownUtil, Mongo mongo)
	{
		this.markdownUtil = markdownUtil;
		this.mongo = mongo;
	}

	public Object get(Request request, Response response)
	{
		final String id = request.params("courseID");
		final Course course = this.mongo.getCourse(id);
		if (course == null)
		{
			throw Spark.halt(404, String.format(UNKNOWN_COURSE_RESPONSE, id));
		}

		final JSONObject result = toJSON(course);
		return result.toString(2);
	}

	private static JSONObject toJSON(Course course)
	{
		final JSONObject result = new JSONObject();
		result.put(Course.PROPERTY_id, course.getId());
		result.put(Course.PROPERTY_userId, course.getUserId());
		result.put(Course.PROPERTY_title, course.getTitle());
		result.put(Course.PROPERTY_description, course.getDescription());
		result.put(Course.PROPERTY_descriptionHtml, course.getDescriptionHtml());
		result.put(Course.PROPERTY_assignmentIds, course.getAssignmentIds());
		return result;
	}

	public Object create(Request request, Response response)
	{
		final String id = IDGenerator.generateID();
		final Course course = new Course(id);

		final String userId = Authenticator.getUserId(request);
		if (userId != null)
		{
			course.setUserId(userId);
		}

		final JSONObject body = new JSONObject(request.body());
		course.setTitle(body.getString(Course.PROPERTY_title));
		course.setDescription(body.getString(Course.PROPERTY_description));
		course.setDescriptionHtml(this.markdownUtil.renderHtml(course.getDescription()));

		final JSONArray assignmentIdArray = body.getJSONArray(Course.PROPERTY_assignmentIds);
		final List<String> assignmentIds = new ArrayList<>();
		for (int i = 0; i < assignmentIdArray.length(); i++)
		{
			assignmentIds.add(assignmentIdArray.getString(i));
		}
		course.setAssignmentIds(assignmentIds);

		this.mongo.saveCourse(course);

		final JSONObject result = new JSONObject();
		result.put(Course.PROPERTY_id, course.getId());
		result.put(Course.PROPERTY_descriptionHtml, course.getDescriptionHtml());
		return result.toString(2);
	}

	public Object getAll(Request request, Response response)
	{
		final String userId = Authenticator.getAndCheckUserIdQueryParam(request);

		final List<Course> courses = this.mongo.getCoursesByUser(userId);

		final JSONArray result = new JSONArray();
		for (final Course course : courses)
		{
			result.put(toJSON(course));
		}
		return result.toString(2);
	}
}
