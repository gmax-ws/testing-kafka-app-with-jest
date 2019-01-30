export const initMock = jest.fn().mockResolvedValue();
export const producerOnMock = jest.fn();
export const producerProduceMock = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    init: initMock,
    getProducer: async () => {
      return new Promise((resolve) => {
        resolve({
          on: producerOnMock,
          produce: producerProduceMock
        });
      });
    }
  };
});

export default mock;
