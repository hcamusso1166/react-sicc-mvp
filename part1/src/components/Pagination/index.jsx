import Button from '../Button'

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className={['pagination', className].filter(Boolean).join(' ')}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        ◀
      </Button>
      {pages.map((page) => (
        <Button
          key={page}
          type="button"
          variant="page"
          isActive={page === currentPage}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        ▶
      </Button>
    </div>
  )
}

export default Pagination