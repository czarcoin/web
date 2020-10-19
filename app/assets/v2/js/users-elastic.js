let users = [];
let usersPage = 1;
let usersNumPages = '';
let usersHasNext = false;
let numUsers = '';
let hackathonId = document.hasOwnProperty('hackathon_id') ? document.hackathon_id : '';

Vue.mixin({
  methods: {
    messageUser: function(handle) {
      let vm = this;
      const url = handle ? `${vm.chatURL}/hackathons/messages/@${handle}` : `${vm.chatURL}/`;

      chatWindow = window.open(url, 'Loading', 'top=0,left=0,width=400,height=600,status=no,toolbar=no,location=no,menubar=no,titlebar=no');
    },

    fetchUsers: function(newPage) {
      let vm = this;

      vm.isLoading = true;
      vm.noResults = false;

      if (newPage) {
        vm.usersPage = newPage;
      }
      vm.params.page = vm.usersPage;

      if (vm.searchTerm) {
        vm.params.search = vm.searchTerm;
      } else {
        delete vm.params['search'];
      }

      if (vm.hideFilterButton) {
        vm.params.persona = 'tribe';
      }

      if (vm.params.persona === 'tribe') {
        // remove filters which do not apply for tribes directory
        delete vm.params['rating'];
        delete vm.params['organisation'];
        delete vm.params['skills'];
      }

      if (vm.tribeFilter) {
        vm.params.tribe = vm.tribeFilter;
      }


      let searchParams = new URLSearchParams(vm.params);

      let apiUrlUsers = `/api/v0.1/users_fetch/?${searchParams.toString()}`;

      if (vm.hideFilterButton) {
        apiUrlUsers += '&type=explore_tribes';
      }

      var getUsers = fetchData(apiUrlUsers, 'GET');

      $.when(getUsers).then(function(response) {

        response.data.forEach(function(item) {
          vm.users.push(item);
        });

        vm.usersNumPages = response.num_pages;
        vm.usersHasNext = response.has_next;
        vm.numUsers = response.count;
        vm.showBanner = response.show_banner;
        vm.persona = response.persona;
        vm.rating = response.rating;
        if (vm.usersHasNext) {
          vm.usersPage = ++vm.usersPage;

        } else {
          vm.usersPage = 1;
        }

        if (vm.users.length) {
          vm.noResults = false;
        } else {
          vm.noResults = true;
        }
        vm.isLoading = false;
      });
    },
    searchUsers: function() {
      let vm = this;

      vm.users = [];

      vm.fetchUsers(1);

    },
    bottomVisible: function() {
      let vm = this;

      const scrollY = window.scrollY;
      const visible = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight - 500;
      const bottomOfPage = visible + scrollY >= pageHeight;

      if (bottomOfPage || pageHeight < visible) {
        if (vm.usersHasNext) {
          vm.fetchUsers();
          vm.usersHasNext = false;
        }
      }
    },
    fetchBounties: function() {
      let vm = this;

      // fetch bounties
      let apiUrlBounties = '/api/v0.1/user_bounties/';

      let getBounties = fetchData(apiUrlBounties, 'GET');

      $.when(getBounties).then((response) => {
        vm.isFunder = response.is_funder;
        vm.funderBounties = response.data;
      });

    },
    openBounties: function(user) {
      let vm = this;

      vm.userSelected = user;
    },
    sendInvite: function(bounty, user) {
      let vm = this;

      console.log(vm.bountySelected, bounty, user, csrftoken);
      let apiUrlInvite = '/api/v0.1/social_contribution_email/';
      let postInvite = fetchData(
        apiUrlInvite,
        'POST',
        {'usersId': [user], 'bountyId': bounty.id},
        {'X-CSRFToken': csrftoken}
      );

      $.when(postInvite).then((response) => {
        console.log(response);
        if (response.status === 500) {
          _alert(response.msg, 'error');

        } else {
          vm.$refs['user-modal'].closeModal();
          _alert('The invitation has been sent', 'info');
        }
      });
    },
    sendInviteAll: function(bountyUrl) {
      let vm = this;
      const apiUrlInvite = '/api/v0.1/bulk_invite/';
      const postInvite = fetchData(
        apiUrlInvite,
        'POST',
        {'params': vm.params, 'bountyId': bountyUrl},
        {'X-CSRFToken': csrftoken}
      );

      $.when(postInvite).then((response) => {
        console.log(response);
        if (response.status !== 200) {
          _alert(response.msg, 'error');

        } else {
          vm.$refs['user-modal'].closeModal();
          _alert('The invitation has been sent', 'info');
        }
      });

    },
    getIssueDetails: function(url) {
      let vm = this;
      const apiUrldetails = `/actions/api/v0.1/bounties/?github_url=${encodeURIComponent(url)}`;

      vm.errorIssueDetails = undefined;

      if (url.indexOf('github.com/') < 0) {
        vm.issueDetails = null;
        vm.errorIssueDetails = 'Please paste a github issue url';
        return;
      }
      vm.issueDetails = undefined;
      const getIssue = fetchData(apiUrldetails, 'GET');

      $.when(getIssue).then((response) => {
        if (response[0]) {
          vm.issueDetails = response[0];
          vm.errorIssueDetails = undefined;
        } else {
          vm.issueDetails = null;
          vm.errorIssueDetails = 'This issue wasn\'t bountied yet.';
        }
      });

    },
    closeModal() {
      this.$refs['user-modal'].closeModal();
    },
    inviteOnMount: function() {
      let vm = this;

      vm.contributorInvite = getURLParams('invite');
      vm.currentBounty = getURLParams('current-bounty');

      if (vm.contributorInvite) {
        let api = `/api/v0.1/users_fetch/?search=${vm.contributorInvite}`;
        let getUsers = fetchData(api, 'GET');

        $.when(getUsers).then(function(response) {
          if (response && response.data.length) {
            vm.openBounties(response.data[0]);
            $('#userModal').bootstrapModal('show');
          } else {
            _alert('The user was not found. Please try using the search box.', 'error');
          }
        });
      }
    },
    extractURLFilters: function(serverFilters) {
      let params = getAllUrlParams();
      let vm = this;

      let columns = serverFilters[vm.header.index]['mappings'][vm.header.type]['properties'];

      if (Object.values(params).length > 0) {
        // eslint-disable-next-line guard-for-in
        for (let prop in params) {
          let meta = columns[prop];

          if (!meta)
            continue;

          if (typeof params[prop] !== 'object') {
            params[prop] = [params[prop]];
          }
          columns[`${prop}_exact`]['selected'] = true;
          columns[`${prop}_exact`]['selectedValues'] = [];
          // eslint-disable-next-line guard-for-in
          for (let key in params[prop]) {

            let value = params[prop][key];

            if (!value)
              continue;
            columns[`${prop}_exact`]['selectedValues'].push(value);

            let _instruction = {
              fun: 'orFilter',
              args: [ 'term', `${prop}_exact`, value ]
            };

            this.addInstruction(_instruction);
          }
        }
        vm.params = params;
      }
      vm.esColumns = columns;
      vm.filterLoaded = true;
    },
    joinTribe: function(user, event) {
      event.target.disabled = true;
      const url = `/tribe/${user.handle}/join/`;
      const sendJoin = fetchData(url, 'POST', {}, {'X-CSRFToken': csrftoken});

      $.when(sendJoin).then(function(response) {
        event.target.disabled = false;

        if (response.is_member) {
          ++user.follower_count;
          user.is_following = true;
        } else {
          --user.follower_count;
          user.is_following = false;
        }

        event.target.classList.toggle('btn-outline-green');
        event.target.classList.toggle('btn-gc-blue');
      }).fail(function(error) {
        event.target.disabled = false;
      });
    }
  }
});
Vue = Vue.extend({
  delimiters: [ '[[', ']]' ]
});


if (document.getElementById('gc-users-elastic')) {

  Vue.component('directory-card', {
    name: 'DirectoryCard',
    delimiters: [ '[[', ']]' ],
    props: [ 'user', 'funderBounties' ]
  });

  Vue.use(innerSearch.default);
  Vue.component('autocomplete', {
    props: [ 'options', 'value' ],
    template: '#select2-template',
    data: function() {
      return {
        selectedFilters: []
      };
    },
    methods: {
      formatMapping: function(item) {
        console.log(item);
        return item.name;
      },
      formatMappingSelection: function(filter) {
        return '';
      }
    },
    mounted() {
      let count = 0;
      let vm = this;
      let mappedFilters = {};
      let data = $.map(this.options, function(obj, key) {

        if (key.indexOf('_exact') === -1)
          return;
        let newKey = key.replace('_exact', '');

        if (mappedFilters[newKey])
          return;
        obj.id = count++;
        obj.text = newKey;
        obj.key = key;

        if (obj.selected) {
          console.log(`${obj.text} is selected`);
          vm.selectedFilters.push(obj.id);
        }

        mappedFilters[newKey] = true;
        mappedFilters[key] = true;
        return obj;
      });


      const s2 = $(vm.$el).select2({
        data: data,
        multiple: true,
        allowClear: true,
        placeholder: 'Search for another filter to add',
        minimumInputLength: 1,
        escapeMarkup: function(markup) {
          return markup;
        }
      })
        .on('change', function() {
          let val = $(vm.$el).val();
          let changeData = $.map(val, function(filter) {
            return data[filter];
          });

          vm.$emit('input', changeData);
        });

      s2.val(vm.selectedFilters);
      s2.trigger('change');
      // fix for wrong position on select open
      var select2Instance = $(vm.$el).data('select2');

      select2Instance.on('results:message', function(params) {
        this.dropdown._resizeDropdown();
        this.dropdown._positionDropdown();
      });
    },
    destroyed: function() {
      $(this.$el).off().select2('destroy');
      this.$emit('destroyed');
    }
  });
  window.UserDirectory = new Vue({
    delimiters: [ '[[', ']]' ],
    el: '#gc-users-elastic',
    data: {
      csrf: document.csrf,
      esColumns: [],
      filterLoaded: false,
      users,
      usersPage,
      usersNumPages,
      usersHasNext,
      numUsers,
      media_url,
      chatURL: document.chatURL || 'https://chat.gitcoin.co/',
      searchTerm: null,
      bottom: false,
      params: {},
      filters: [],
      funderBounties: [],
      currentBounty: undefined,
      contributorInvite: undefined,
      isFunder: false,
      bountySelected: null,
      userSelected: [],
      showModal: false,
      showFilters: !document.getElementById('explore_tribes'),
      skills: document.keywords,
      selectedSkills: [],
      noResults: false,
      isLoading: true,
      gitcoinIssueUrl: '',
      issueDetails: undefined,
      errorIssueDetails: undefined,
      showBanner: undefined,
      persona: undefined,
      hideFilterButton: !!document.getElementById('explore_tribes')
    },
    methods: {
      resetCallback: function() {
        this.checkedItems = [];
      },
      autoCompleteDestroyed: function() {
        this.filters = [];
      },
      autoCompleteChange: function(filters) {
        this.filters = filters;
      },
      outputToCSV: function() {

        let url = '/api/v0.1/users_csv/';

        const csvRequest = fetchData(url, 'POST', JSON.stringify(this.body), {'X-CSRFToken': vm.csrf, 'Content-Type': 'application/json;'});

        $.when(csvRequest).then(json => {
          _alert(json.message);
        }).catch(() => _alert('There was an issue processing your request'));
      },

      fetchMappings: function() {
        let vm = this;

        $.when(vm.header.client.indices.getMapping())
          .then(response => {

            this.extractURLFilters(response);
            this.mount();
            this.fetch(this);
          });
      }
    },
    mounted() {
      this.fetchMappings();
    },
    created() {
      this.setHost(document.contxt.search_url);
      this.setIndex('haystack');
      this.setType('modelresult');
    },
    beforeMount() {
      window.addEventListener('scroll', () => {
        this.bottom = this.bottomVisible();
      }, false);
    },
    beforeDestroy() {
      window.removeEventListener('scroll', () => {
        this.bottom = this.bottomVisible();
      });
    }
  });
}
