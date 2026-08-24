/* ============================================================
   locations.js — Pan-India States & Districts Manager
   Handles fetching location data and populating cascading dropdowns
   ============================================================ */

const LocationsManager = {
    data: null,

    async init() {
        if (this.data) return this.data;
        try {
            const res = await fetch('./assets/india_states_districts.json');
            this.data = await res.json();
            return this.data;
        } catch (error) {
            console.error("Failed to load locations JSON:", error);
            return null;
        }
    },

    async populateStates(selectId, defaultState = 'Uttarakhand') {
        await this.init();
        const select = document.getElementById(selectId);
        if (!select || !this.data) return;

        select.innerHTML = '<option value="" disabled>Select State</option>';
        this.data.states.forEach(stateObj => {
            const option = document.createElement('option');
            option.value = stateObj.state;
            option.textContent = stateObj.state;
            if (stateObj.state === defaultState) option.selected = true;
            select.appendChild(option);
        });
    },

    async populateDistricts(stateName, selectId, defaultDistrict = 'Dehradun') {
        await this.init();
        const select = document.getElementById(selectId);
        if (!select || !this.data) return;

        const stateObj = this.data.states.find(s => s.state === stateName);
        select.innerHTML = '<option value="" disabled>Select District</option>';
        
        if (stateObj) {
            stateObj.districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district;
                if (district === defaultDistrict) option.selected = true;
                select.appendChild(option);
            });
        }
    },

    async setupCascadingDropdowns(stateSelectId, districtSelectId, defaultState = 'Uttarakhand', defaultDistrict = 'Dehradun', onChangeCallback = null) {
        await this.populateStates(stateSelectId, defaultState);
        await this.populateDistricts(defaultState, districtSelectId, defaultDistrict);

        const stateSelect = document.getElementById(stateSelectId);
        const districtSelect = document.getElementById(districtSelectId);

        if (stateSelect) {
            stateSelect.addEventListener('change', async (e) => {
                const newState = e.target.value;
                await this.populateDistricts(newState, districtSelectId, '');
                // Auto-select first district in the new state
                if (districtSelect.options.length > 1) {
                    districtSelect.selectedIndex = 1;
                }
                if (onChangeCallback) onChangeCallback(districtSelect.value, newState);
            });
        }

        if (districtSelect) {
            districtSelect.addEventListener('change', (e) => {
                if (onChangeCallback) onChangeCallback(e.target.value, stateSelect.value);
            });
        }
    }
};

window.LocationsManager = LocationsManager;
