package org.fulib.webapp;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.CreateCollectionOptions;
import org.bson.Document;
import org.junit.Test;
import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoDatabase;
import com.mongodb.MongoClientSettings;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Map;

import static java.time.format.DateTimeFormatter.ISO_LOCAL_TIME;


public class MongoDBTest
{
   @Test
   public void testConnectToMongo()
   {
      Map<String, String> env = System.getenv();
      String password = env.get("fulib_org_mongo");
      ConnectionString connString = new ConnectionString(
            "mongodb://seadmin:" + password + "@avocado.uniks.de:38128"
      );
      MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(connString)
            .retryWrites(true)
            .build();
      MongoClient mongoClient = MongoClients.create(settings);
      MongoDatabase database = mongoClient.getDatabase("test");

      MongoCollection<Document> coll = database.getCollection("myTestCollection");

//      String timeColonPattern = "HH:mm:ss SSS";
//      DateTimeFormatter timeColonFormatter = DateTimeFormatter.ofPattern(timeColonPattern);
//      LocalTime colonTime = LocalTime.of(17, 35, 50).plus(329, ChronoUnit.MILLIS);
//      System.out.println(timeColonFormatter.format(colonTime));

      DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");
      LocalDateTime now = LocalDateTime.now();
      String time = now.format(formatter);


      Document document = new Document("name", "log "+time)
            .append("user", "JUnit Test");

      coll.insertOne(document);
      System.out.println(coll);
   }
}
