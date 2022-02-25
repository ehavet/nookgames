const aWeekInMs = 604800000
const expirationDate = new Date(Date.now() + aWeekInMs)
const epochDate = new Date(0)

export class CookieRepository {
    create(id) {
        if (!this.get(id)) document.cookie = `${id}={};path=/;expires=${expirationDate}`
    }

    get(id) {
        const cookieValue = getCookieValue(id)
        if (cookieValue) return JSON.parse(cookieValue)
        return null
    }

    update(id, cookieValuesObject) {
        document.cookie = `${id}=${JSON.stringify(cookieValuesObject)};path=/;expires=${expirationDate}`
        return this.get(id)
    }

    delete(id) {
        document.cookie = `${id}=;path=/;expires=${epochDate}`
    }
}

function getCookieValue(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)===' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
