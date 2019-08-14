package org.fulib.scenarios.mongo;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;
import org.json.JSONObject;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class Mongo
{
   private static Mongo theMongo = null;
   private MongoClient mongoClient = null;
   private MongoDatabase database = null;
   private MongoCollection<Document> coll = null;

   public static Mongo get()
   {
      if (theMongo == null) {
         theMongo = new Mongo();
      }

      return theMongo;
   }

   public Mongo() {
      Map<String, String> env = System.getenv();
      String password = env.get("fulib_org_mongo");

      if (password != null)
      {
         ConnectionString connString = new ConnectionString(
               "mongodb://seadmin:" + password + "@avocado.uniks.de:38128"
         );
         MongoClientSettings settings = MongoClientSettings.builder()
               .applyConnectionString(connString)
               .retryWrites(true)
               .build();
         mongoClient = MongoClients.create(settings);
         database = mongoClient.getDatabase("test");

         coll = database.getCollection("fulib-org-log");
      }
   }

   public void log(JSONObject body, JSONObject result)
   {
      if (coll == null) {
         return;
      }

      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
      LocalDateTime now = LocalDateTime.now();
      String key = now.format(formatter);

      Document document = new Document("name", key)
            .append("body", body.toString(3))
            .append("result", result.toString(3));

      coll.insertOne(document);
   }
}
