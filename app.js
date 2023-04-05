import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const host = '127.0.0.1';
const port = 8000;

app.use(express.json());

const client = new MongoClient('mongodb://127.0.0.1:27017');

await client.connect().catch(err => console.log(err));
console.log('database connected');

const database = client.db('maktab88');

const usersCollection = database.collection('users');

const checkConnection = async (req, res, next) => {
	await client.connect().catch(console.log);

	next();
};

// *1st > user-router.js
// app.use(checkConnection);

// *2nd
// app.use('/users', checkConnection);

// *3rd
app.get('/users', checkConnection, async (req, res) => {
	try {
		const users = await usersCollection.find({}).toArray();

		res.json({
			status: 'success',
			data: { users }
		});
	} catch (error) {
		res.json({
			status: 'error',
			message: 'something went wrong'
		});
	} finally {
		await client.close();
	}
});

app.post('/users', checkConnection, async (req, res) => {
	try {
		const { firstname, lastname, username, password } = req.body;
		const result = await usersCollection.insertOne({
			firstname,
			lastname,
			username,
			password
		});

		res.json({
			status: 'success',
			data: { result }
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 'error',
			message: 'something went wrong'
		});
	} finally {
		await client.close();
	}
});

app.get('/users/:userId', checkConnection, async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

		res.json({
			status: 'success',
			data: { user }
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 'error',
			message: 'something went wrong'
		});
	} finally {
		await client.close();
	}
});

app.patch('/users/:userId', checkConnection, async (req, res) => {
	try {
		const modifiedInfo = req.body;
		const { userId } = req.params;

		const result = await usersCollection.findOneAndUpdate(
			{ _id: new ObjectId(userId) },
			{ $set: modifiedInfo }
		);

		res.json({
			status: 'success',
			data: { result }
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 'error',
			message: 'something went wrong'
		});
	} finally {
		await client.close();
	}
});

app.delete('/users/:userId', checkConnection, async (req, res) => {
	try {
		const { userId } = req.params;

		const result = await usersCollection.findOneAndDelete({
			_id: new ObjectId(userId)
		});

		res.json({
			status: 'success',
			data: { result }
		});
	} catch (error) {
		console.log(error);
		res.json({
			status: 'error',
			message: 'something went wrong'
		});
	} finally {
		await client.close();
	}
});

app.listen(port, host, () => console.log(`Listening on ${host}:${port} ...`));
