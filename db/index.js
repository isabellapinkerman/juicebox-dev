const { Client } = require("pg");

const client = new Client("postgres://localhost:5432/juicebox-dev");

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, name, location, active
        FROM users;`
  );
  return rows;
}
//------------------------------------------------------------------
async function createUser({ username, password, name, location }) {
  try {
    const {
      rows: [user],
    } = await client.query(
      `
        INSERT INTO users(username, password, name, location) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
        RETURNING *;
        `,
      [username, password, name, location]
    );

    return user;
  } catch (error) {
    throw error;
  }
}
//-------------------------------------------------
async function updateUser(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
    UPDATE users
    SET ${setString}
    WHERE id=${id}
    RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}
//------------------------------------
async function createPost({ authorId, title, content }) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
              INSERT INTO posts("authorId", title, content) 
              VALUES ($1, $2, $3)
              RETURNING *;
              `,
      [authorId, title, content]);

      const tagList = await createTags(tags);

      return await addTagsToPost(post.id, tagList)
  } catch (error) {
    throw error;
  }
}
//------------------------------------
//check back on this function if there is errors
//redo
//help ticket
async function updatePost(id, fields = {}) {
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [post],
    } = await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
      `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    throw error;
  }
}
//===================================
//authorId in ""?
async function getAllPosts() {
  try {
    const { rows: postIds } = await client.query(`
      SELECT id
      FROM posts;
      `);

      const posts = await Promise.all(postIds.map(
        post => getPostById( post.id )
      ));

    return posts;
  } catch (error) {
    throw error;
  }
}
//---------------------------
async function getPostsByUser(userId) {
  try {
    const { rows: postIds } = await client.query(`
        SELECT id
        FROM posts
        WHERE "authorId"=${userId};
        `);

        const posts = await Promise.all(postIds.map(
          post => getPostById( post.id )
        ))
    return posts;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  console.log("this is GETUSERSBYID");
  try {
    const {
      rows: [user],
    } = await client.query(`
        SELECT id, username, name, location, active
        FROM users
        WHERE "id"=${userId};
    `);

    if (!user) {
      return null;
    }

    user.posts = await getPostsByUser(userId);

    return user;
  } catch (error) {
    console.log("catch error = null in getUserById");
    throw error;
  }
}

async function getPostById(postId) {
  try {
    const {
      rows: [post],
    } = await client.query(
      `
      SELECT *
      FROM posts
      WHERE id=$1;
    `,
      [postId]
    );

    const { rows: tags } = await client.query(
      `
      SELECT tags.*
      FROM tags
      JOIN post_tags ON tags.id=post_tags."tagId"
      WHERE post_tags."postId"=$1;
    `,
      [postId]
    );

    const {
      rows: [author],
    } = await client.query(
      `
      SELECT id, username, name, location
      FROM users
      WHERE id=$1;
    `,
      [post.authorId]
    );

    post.tags = tags;
    post.author = author;

    delete post.authorId;

    return post;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  updatePost,
  getUserById,
  createPost,
  getPostsByUser,
  getPostById,
};
