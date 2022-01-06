import { gql } from "@apollo/client";

export default class OperationDocsStore {
  static getAll() {
    return `query MyQuery {
  students {
    name
    id
    teacher_id
  }
}`;
  }

  static addOne(name) {
    return `mutation MyMutation {
  insert_students(objects: {nae: "${name}"}) {
    returning {
      id
      name
      teacher_id
    }
  }
}
`;
  }

  static deleteById(id) {
    return `mutation MyMutation {
  delete_students(where: {id: {_eq: "${id}"}}) {
    affected_rows
  }
}
`;
  }

  static subscribeToAll() {
    return gql`
      subscription MySubscription {
        students {
          id
          name
          teacher_id
        }
      }
    `;
  }
}
