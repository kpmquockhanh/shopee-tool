db.createUser(
  {
    user: 'kpm',
    pwd: '123456',
    roles: [
      {
        role: 'readWrite',
        db: 'kpm',
      },
    ],
  },
);
