import { Forms, Tags } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { TAG_TYPES } from '../../constants';
import { paginate } from './utils';

/**
 * Query generator for filtering form
 * @param {String} tag - Form tag id
 * @return generated query
 */
const listQuery = async params => {
  let selector = {};

  // Filter by tag
  if (params.tag) {
    selector.tagIds = params.tag;
  }

  return selector;
};

const formQueries = {
  /**
   * Forms list
   * @param {Object} args - Search params
   * @param {String} args.tag - Tag id to filter
   * @return {Promise} sorted forms list
   */
  async forms(root, args) {
    const selector = await listQuery(args);

    const forms = paginate(Forms.find(selector), args);

    return forms.sort({ name: 1 });
  },

  /**
   * Get one form
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found form
   */
  formDetail(root, { _id }) {
    return Forms.findOne({ _id });
  },

  /**
   * Form's filtered and total counts
   * @return {Promise} object containing counts
   */
  async formsTotalCount() {
    const counts = {
      byTag: {},
      total: 0,
    };

    const count = query => {
      return Forms.find(query).count();
    };

    // Count forms by tag
    const tags = await Tags.find({ type: TAG_TYPES.FORM });

    for (let tag of tags) {
      counts.byTag[tag._id] = await count({ tagIds: tag._id });
    }

    // Total count of form
    counts.total = await Forms.find({}).count();

    return counts;
  },
};

moduleRequireLogin(formQueries);

export default formQueries;
