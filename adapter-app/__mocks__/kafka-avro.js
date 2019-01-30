export const initMock = jest.fn().mockResolvedValue();
export const consumerOnMock = jest.fn().mockResolvedValue();
export const consumerConnectMock = jest.fn().mockResolvedValue();

const mock = jest.fn().mockImplementation(() => {
  return {
    init: initMock,
    getConsumer: async () => {
      return new Promise((resolve) => {
        resolve({
          on: consumerOnMock,
          connect: consumerConnectMock
        });
      });
    }
  };
});

export default mock;
