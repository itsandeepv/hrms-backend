const getIndiaMartKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';
    for (let i = 0; i < 16; i++) {
        uniqueId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return uniqueId;
}

module.exports = { getIndiaMartKey }