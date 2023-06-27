"use strict";

const anxeb = require("anxeb-node");

module.exports = {
  url: "/tasks",
  type: anxeb.Route.types.action,
  access: anxeb.Route.access.public,
  owners: "*",
  roles: {
    get: "*",
    post: ["*"],
    put: ["*"],
    delete: ["*"],
  },
  timeout: 60000,
  methods: {

    get: async function (context) {
      const tasks = await context.data.list.Task();
      context.send(tasks);
    },

    post: async function (context) {
      const payload = context.payload.task || context.payload;

      const newTask = context.data.create.Task({
        name: payload.name,
        description: payload.description,
        user: payload.user,
      });
      await newTask.persist();
      context.send(newTask.toClient());
    },
  },
  childs: {
    item: {
      url: "/:taskId",
      methods: {
        get: async function (context) {
          const task = await context.data.retrieve.Task(context.params.taskId);

          if (!task) {
            context.log.exception.record_not_found
              .args("Tarea", context.params.taskId)
              .throw();
          }
          context.send(task.toClient());
        },

        put: async function (context) {
          const task = await context.data.retrieve.Task(context.params.taskId);
          const payload = context.payload.task || context.payload;
          if (!task) {
            context.log.exception.record_not_found
              .args("Task", context.params.taskId)
              .throw();
          }
          if (true) {
            (task.name = payload.name),
            (task.description = payload.description),
            await task.persist();
            context.send(task.toClient());
          } else if (task.owner == context.profile.identity) {
            (task.name = payload.name),
              (task.description = payload.description),
              (task.done = payload.done),
              (task.date = anxeb.utils.date.now().unix()),
              await task.persist();
            context.send(task.toClient());
          } else {
            context.send("No puedes editar");
          }
        },
        

        delete: async function (context) {
          const task = await context.data.retrieve.Task(context.params.taskId);
          if (!task) {
            context.log.exception.record_not_found
              .args("Task", context.params.taskId)
              .throw();
          }
          await task.delete();
          context.ok();
        },
      },
    },
  },
};
