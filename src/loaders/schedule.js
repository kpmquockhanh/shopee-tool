import nodeSchedule from 'node-schedule';

export default (app) => {
  nodeSchedule.scheduleJob('* * * * *', () => {
    console.log('Job has been triggered at: ', new Date());

    const rabbitmqConnection = app.get('mqConnection');
    rabbitmqConnection.sendToQueue('health-check', {
      time: new Date(),
    }).then();
  });
};
