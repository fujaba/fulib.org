package org.fulib.webapp.projects.members;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Indexes;
import org.bson.BsonValue;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.fulib.webapp.projects.db.Mongo;
import org.fulib.webapp.projects.projects.Project;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

public class MemberRepository
{
	public static final String COLLECTION_NAME = "projectMembers";

	private final MongoCollection<Member> members;

	@Inject
	public MemberRepository(Mongo mongo)
	{
		this.members = mongo
			.getDatabase()
			.getCollection(COLLECTION_NAME, Member.class)
			.withCodecRegistry(mongo.getCodecRegistry());
		this.members.createIndex(Indexes.ascending(Member.PROPERTY_PROJECT_ID));
		this.members.createIndex(Indexes.ascending(Member.PROPERTY_USER_ID));
	}

	public Member findOne(String projectId, String userId)
	{
		return this.members.find(buildIdFilter(projectId, userId)).first();
	}

	public List<Member> findByProject(String projectId)
	{
		return this.members.find(buildProjectIdFilter(projectId)).into(new ArrayList<>());
	}

	public List<Member> findByUser(String userId)
	{
		return this.members.find(buildUserIdFilter(userId)).into(new ArrayList<>());
	}

	public void create(Member member)
	{
		this.members.insertOne(member);
	}

	public void update(Member member)
	{
		this.members.replaceOne(buildIdFilter(member.getProjectId(), member.getUserId()), member);
	}

	public Member deleteOne(String projectId, String userId)
	{
		return this.members.findOneAndDelete(buildIdFilter(projectId, userId));
	}

	public void deleteByProject(String projectId)
	{
		this.members.deleteMany(buildProjectIdFilter(projectId));
	}

	public void deleteByUser(String userId)
	{
		this.members.deleteMany(buildUserIdFilter(userId));
	}

	private Bson buildProjectIdFilter(String projectId)
	{
		return Filters.eq(Member.PROPERTY_PROJECT_ID, projectId);
	}

	private Bson buildUserIdFilter(String userId)
	{
		return Filters.eq(Member.PROPERTY_USER_ID, userId);
	}

	private Bson buildIdFilter(String projectId, String userId)
	{
		return Filters.and(buildProjectIdFilter(projectId), buildUserIdFilter(userId));
	}
}
