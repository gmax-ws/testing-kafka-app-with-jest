export const sendMock = jest.fn();
export const Producer = jest.fn().mockImplementation(() => {
  return {
    send: sendMock
  };
});

export const KafkaClient = jest.fn().mockImplementation(() => {});
