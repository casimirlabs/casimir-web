import { ref } from 'vue'
import { AddAccountOptions, ProviderString, RemoveAccountOptions, UserWithAccounts, Account, ExistingUserCheck, ErrorSuccessInterface } from '@casimir/types'
import useEnvironment from '@/composables/environment'
import * as Session from 'supertokens-web-js/recipe/session'

const { usersBaseURL } = useEnvironment()

// 0xd557a5745d4560B24D36A68b52351ffF9c86A212
const session = ref<boolean>(false)
const user = ref<UserWithAccounts>()

export default function useUsers () {

    async function addAccount(account: AddAccountOptions): Promise<ErrorSuccessInterface> {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ account })
            }
            const response = await fetch(`${usersBaseURL}/user/add-sub-account`, requestOptions)
            const { error, message, data: userAccount } = await response.json()
            user.value = userAccount
            return { error, message, data: userAccount }
        } catch (error) {
            console.log('Error in addAccount in wallet.ts :>> ', error)
            return { error: true, message: 'Error adding account', data: null }
        }
    }

    async function checkIfPrimaryUserExists(provider: ProviderString, address: string): Promise<ExistingUserCheck> {
        try {
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
            }
            const response = await fetch(`${usersBaseURL}/auth/check-if-primary-address-exists/${provider}/${address}`, requestOptions)
            const { error, message, data } = await response.json()
            if (error) throw new Error(message)
            return data
        } catch (error) {
            throw new Error(error.message || 'Error checking if primary user exists')
        }
    }

    async function checkIfSecondaryAddress(address: string) : Promise<Account[]> {
        try {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const response = await fetch(`${usersBaseURL}/auth/check-secondary-address/${address}`, requestOptions)
            const { error, message, data: users } = await response.json()
            if (error) throw new Error(message)
            return users
        } catch (error) {
            throw new Error(error.message || 'Error checking if secondary address')
        }
    }

    /**
     * Checks if session exists and, if so: 
     * Gets the user's account via the API
     * Sets the user's account locally
    */
    async function checkUserSessionExists() : Promise<boolean> {
        try {
            session.value = await Session.doesSessionExist()
            if (session.value) {
                const { data: user } = await getUser()
                if (user) {
                    setUser(user)
                    return true
                } else {
                    return false
                }
            }
            return false
        } catch (error) {
            console.log('Error in checkUserSessionExists in wallet.ts :>> ', error)
            return false
        }
    }

    async function getMessage(address: string) {
        const response = await fetch(`${usersBaseURL}/auth/${address}`)
        const json = await response.json()
        const { message } = json
        return message
    }

    async function getUser() : Promise<ErrorSuccessInterface> {
        try {
            const requestOptions = {
                method: 'GET',
                headers: { 
                    'Content-Type': 'application/json'
                }
            }
            const response = await fetch(`${usersBaseURL}/user`, requestOptions)
            const { user, error, message } = await response.json()
            return {
                error,
                message,
                data: user
            }
        } catch (error) {
            throw new Error('Error getting user from API route')
        }
    }

    async function removeAccount({ address, currency, ownerAddress, walletProvider }: RemoveAccountOptions) {
        address = address.toLowerCase()
        const requestOptions = {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                address,
                currency,
                ownerAddress,
                walletProvider,
            })
        }
        const response = await fetch(`${usersBaseURL}/user/remove-sub-account`, requestOptions)
        const { data: userAccount } = await response.json()
        user.value = userAccount
        return { error: false, message: `Account removed from user: ${userAccount}`, data: userAccount }
    }

    function setUser(newUser?: UserWithAccounts) {
        user.value = newUser
    }

    async function updatePrimaryAddress(updatedAddress: string) {
        const userId = user?.value?.id
        const requestOptions = {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, updatedAddress })
        }
        return await fetch(`${usersBaseURL}/user/update-primary-account`, requestOptions)
    }

    return {
        session,
        user,
        addAccount,
        checkIfSecondaryAddress,
        checkIfPrimaryUserExists,
        checkUserSessionExists,
        getMessage,
        getUser,
        removeAccount,
        setUser,
        updatePrimaryAddress
    }
}