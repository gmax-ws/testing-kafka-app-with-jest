export const onMock = jest.fn((eventName, callback) => callback());
export const Consumer = jest.fn().mockImplementation(() => {
  return {
    on: onMock
  };
});

export const KafkaClient = jest.fn().mockImplementation(() => {});
