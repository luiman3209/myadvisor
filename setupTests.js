const { sequelize } = require('./models/models'); 



beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await sequelize.sync({ force: true });
});

afterEach(() => {
  jest.restoreAllMocks();
});