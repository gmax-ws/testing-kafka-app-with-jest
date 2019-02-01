export const sendMock = jest.fn();
export const onMock = jest.fn((eventName, callback) => callback());
export const Producer = jest.fn().mockImplementation(() => {
  return {
    on: onMock,
    send: sendMock
  };
});

export const KafkaClient = jest.fn().mockImplementation(() => {});
